import { QueueName, getQueue } from "@workspace/queue"
import { publishMeetingEvent } from "../../lib/meeting-events"
import {
  buildMeetingAudioKey,
  createPresignedAudioUpload,
  headUploadedObject,
  putMeetingAudioObject,
} from "../../lib/s3-predesign"
import { fetchRemoteUpload, RemoteUrlError } from "../../lib/remote-url"
import { uploadsRepo } from "./uploads.repo"
import path from "node:path"

export type CompleteUploadResult =
  | { ok: true; meetingId: string; status: string }
  | {
      ok: false
      error:
        | "MEETING_NOT_FOUND"
        | "MEETING_FORBIDDEN"
        | "MEETING_NOT_PENDING"
        | "OBJECT_NOT_IN_S3"
      message?: string
    }

function deriveTitleFromFileName(fileName: string): string {
  const withoutExt = path.parse(fileName).name
  return withoutExt.length > 0 ? withoutExt.slice(0, 200) : "Untitled meeting"
}

export async function presignUpload(input: {
  workspaceId: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  title?: string
}) {
  const { workspaceId, userId, fileName, fileType, fileSize, title } = input

  const meeting = await uploadsRepo.createPendingMeeting({
    workspaceId,
    userId,
    title: title?.trim() || deriveTitleFromFileName(fileName),
    fileName,
    fileType,
    fileSize,
  })

  const { key, url, expiresInSeconds } = await createPresignedAudioUpload({
    meetingId: meeting.id,
    fileType,
  })

  // Persist the key eagerly so /complete can HeadObject without recomputing.
  await uploadsRepo.attachAudioKey(meeting.id, key)

  return { meetingId: meeting.id, key, url, expiresInSeconds }
}

export async function completeUpload(input: {
  meetingId: string
  workspaceId: string
  userId: string
  traceId?: string
}): Promise<CompleteUploadResult> {
  const { meetingId, workspaceId, userId, traceId } = input

  const meeting = await uploadsRepo.findById(meetingId)

  if (!meeting) return { ok: false, error: "MEETING_NOT_FOUND" }
  if (meeting.workspaceId !== workspaceId) {
    return { ok: false, error: "MEETING_FORBIDDEN" }
  }

  if (meeting.status !== "PENDING_UPLOAD") {
    return { ok: false, error: "MEETING_NOT_PENDING" }
  }

  const audioKey = meeting.audioKey ?? buildMeetingAudioKey(meeting.id)

  // Trust S3 for size, not the client (guards billing/metering).
  let actualSize: number | null = null
  try {
    const head = await headUploadedObject(audioKey)
    actualSize = head.contentLength
  } catch (err) {
    return {
      ok: false,
      error: "OBJECT_NOT_IN_S3",
      message: (err as Error).message,
    }
  }

  const { updated } = await uploadsRepo.markUploaded({
    meetingId: meeting.id,
    workspaceId,
    fileSize: actualSize,
  })

  if (updated === 0) {
    // Another request got there first (double-click, retry).
    return { ok: false, error: "MEETING_NOT_PENDING" }
  }

  await getQueue(QueueName.Transcribe).add(
    "transcribe",
    {
      meetingId: meeting.id,
      workspaceId: meeting.workspaceId,
      userId,
      audioKey,
      traceId,
    },
    { jobId: `transcribe-${meeting.id}` }
  )

  await publishMeetingEvent({
    meetingId: meeting.id,
    meetingStatus: "UPLOADED",
  })

  return {
    ok: true,
    meetingId: meeting.id,
    status: "UPLOADED",
  }
}

export async function listRecentUploads(workspaceId: string, limit: number) {
  return uploadsRepo.listRecentUploadMeetings(workspaceId, limit)
}

export type ImportFromUrlResult =
  | CompleteUploadResult
  | {
      ok: false
      error:
        | "INVALID_URL"
        | "BLOCKED_HOST"
        | "UNSUPPORTED_TYPE"
        | "FILE_TOO_LARGE"
        | "FETCH_FAILED"
        | "REDIRECT_LOOP"
      message?: string
    }

export async function importFromUrl(input: {
  workspaceId: string
  userId: string
  url: string
  title?: string
  traceId?: string
}): Promise<ImportFromUrlResult> {
  const { workspaceId, userId, url, title, traceId } = input

  let remote
  try {
    remote = await fetchRemoteUpload(url)
  } catch (err) {
    if (err instanceof RemoteUrlError) {
      return { ok: false, error: err.code, message: err.message }
    }
    return {
      ok: false,
      error: "FETCH_FAILED",
      message: err instanceof Error ? err.message : undefined,
    }
  }

  const meeting = await uploadsRepo.createPendingMeeting({
    workspaceId,
    userId,
    title: title?.trim() || deriveTitleFromFileName(remote.fileName),
    fileName: remote.fileName,
    fileType: remote.fileType,
    fileSize: remote.fileSize,
  })

  const { key } = await putMeetingAudioObject({
    meetingId: meeting.id,
    fileType: remote.fileType,
    body: remote.body,
  })

  await uploadsRepo.attachAudioKey(meeting.id, key)

  return completeUpload({
    meetingId: meeting.id,
    workspaceId,
    userId,
    traceId,
  })
}
