import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "../config/env"
import { s3 } from "./s3"

const PRESIGNED_GET_TTL_SECONDS = 60 * 10

export function buildMeetingAudioKey(meetingId: string): string {
  return `meetings/${meetingId}/audio`
}

export async function createPresignedAudioDownload(key: string): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    }),
    { expiresIn: PRESIGNED_GET_TTL_SECONDS }
  )
}

export async function uploadMeetingAudio(params: {
  meetingId: string
  body: Buffer
  contentType?: string
}): Promise<string> {
  const key = buildMeetingAudioKey(params.meetingId)
  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: params.contentType ?? "audio/mpeg",
      Body: params.body,
    })
  )
  return key
}

export async function saveRawTranscriptJson(params: {
  meetingId: string
  payload: unknown
}): Promise<string> {
  const key = `transcripts/${params.meetingId}.json`
  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: "application/json",
      Body: JSON.stringify(params.payload),
    })
  )
  return key
}
