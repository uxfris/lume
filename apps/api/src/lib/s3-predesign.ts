import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "../config/env"
import { s3 } from "./s3"

const PRESIGN_TTL_SECONDS = 60 * 10
const PRESIGNED_GET_TTL_SECONDS = 60 * 10

/**
 * Build the canonical S3 key for a meeting's source audio. Meeting-centric so
 * deletes/scans can be done by meeting id and objects outlive any workspace
 * rename.
 */
export function buildMeetingAudioKey(meetingId: string): string {
  return `meetings/${meetingId}/audio`
}

export async function createPresignedAudioUpload(params: {
  meetingId: string
  fileType: string
}) {
  const key = buildMeetingAudioKey(params.meetingId)

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: params.fileType,
  })

  const url = await getSignedUrl(s3, command, {
    expiresIn: PRESIGN_TTL_SECONDS,
  })

  return {
    key,
    url,
    expiresInSeconds: PRESIGN_TTL_SECONDS,
  }
}

/**
 * Returns the authoritative size + content type from S3 for an uploaded
 * object. Use this in `/uploads/:id/complete` to avoid trusting
 * client-supplied size for metering or storage limits.
 */
export async function createPresignedAudioDownload(
  key: string
): Promise<{ url: string; expiresInSeconds: number }> {
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    }),
    { expiresIn: PRESIGNED_GET_TTL_SECONDS }
  )
  return { url, expiresInSeconds: PRESIGNED_GET_TTL_SECONDS }
}

export async function headUploadedObject(key: string) {
  const command = new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: key })
  const result = await s3.send(command)
  return {
    contentLength: result.ContentLength ?? null,
    contentType: result.ContentType ?? null,
  }
}
