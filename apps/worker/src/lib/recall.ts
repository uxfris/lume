import { env } from "../config/env"

/**
 * Single transcript participant block returned by Recall's transcript
 * `download_url`. Matches the shape documented at
 * https://docs.recall.ai/docs/bot-real-time-transcription#transcript-download-url-data-schema.
 */
export interface RecallTranscriptParticipantBlock {
  participant: {
    id: number
    name: string | null
    is_host: boolean | null
    platform: string | null
    extra_data: unknown
    email: string | null
  }
  language_code: string
  words: Array<{
    text: string
    start_timestamp: { absolute: string | null; relative: number }
    end_timestamp: { absolute: string | null; relative: number }
  }>
}

interface BotResponse {
  id?: string
  recordings?: Array<{
    id?: string
    media_shortcuts?: {
      transcript?: {
        id?: string
        data?: { download_url?: string | null }
      }
    }
  }>
}

interface RecallMixedAudioListResponse {
  results?: Array<{
    status?: { code?: string }
    data?: { download_url?: string | null }
  }>
}

class WorkerRecallError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "WorkerRecallError"
    this.status = status
  }
}

function authHeaders(): Record<string, string> {
  if (!env.RECALL_API_KEY) {
    throw new WorkerRecallError(
      "Recall.ai is not configured: set RECALL_API_KEY in the worker",
      500
    )
  }
  return {
    Authorization: `Token ${env.RECALL_API_KEY}`,
    Accept: "application/json",
  }
}

/**
 * Resolve the transcript download URL for a bot. Picks the first recording
 * with a `transcript.data.download_url` populated. Recall's recordings are
 * append-only so the latest is at the end; we still take the first non-null
 * URL because older recordings should always have completed first.
 */
export async function getBotTranscriptDownloadUrl(
  botId: string
): Promise<{ downloadUrl: string; transcriptId: string | null }> {
  const bot = await fetchBot(botId)
  const recordings = bot.recordings ?? []
  for (const recording of recordings) {
    const url = recording.media_shortcuts?.transcript?.data?.download_url
    if (url) {
      return {
        downloadUrl: url,
        transcriptId: recording.media_shortcuts?.transcript?.id ?? null,
      }
    }
  }
  throw new WorkerRecallError(
    "Recall bot has no transcript download URL yet",
    404
  )
}

/**
 * Resolve the transcript download URL when we already have a transcript id
 * (e.g. captured from the `transcript.done` webhook payload).
 */
export async function getTranscriptDownloadUrlById(
  transcriptId: string
): Promise<string> {
  const response = await fetch(
    `${env.RECALL_API_URL}/transcript/${transcriptId}/`,
    { method: "GET", headers: authHeaders() }
  )
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new WorkerRecallError(
      `Recall transcript fetch failed (${response.status}): ${text || response.statusText}`,
      response.status
    )
  }
  const json = (await response.json()) as {
    data?: { download_url?: string | null }
  }
  const url = json.data?.download_url
  if (!url) {
    throw new WorkerRecallError("Recall transcript has no download URL", 404)
  }
  return url
}

/**
 * Stream the transcript JSON from a Recall presigned URL. The URL does NOT
 * take an Authorization header.
 */
export async function downloadTranscriptJson(
  downloadUrl: string
): Promise<RecallTranscriptParticipantBlock[]> {
  const response = await fetch(downloadUrl, { method: "GET" })
  if (!response.ok) {
    throw new WorkerRecallError(
      `Failed to download Recall transcript (${response.status})`,
      response.status
    )
  }
  return (await response.json()) as RecallTranscriptParticipantBlock[]
}

async function fetchBot(botId: string): Promise<BotResponse> {
  const response = await fetch(`${env.RECALL_API_URL}/bot/${botId}/`, {
    method: "GET",
    headers: authHeaders(),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new WorkerRecallError(
      `Recall bot fetch failed (${response.status}): ${text || response.statusText}`,
      response.status
    )
  }
  return (await response.json()) as BotResponse
}

function pickRecordingId(bot: BotResponse): string {
  const recordings = bot.recordings ?? []
  const recordingId =
    recordings[recordings.length - 1]?.id ?? recordings[0]?.id ?? null
  if (!recordingId) {
    throw new WorkerRecallError("Recall bot has no recordings yet", 404)
  }
  return recordingId
}

/**
 * Resolve a mixed MP3 download URL for a bot recording.
 * @see https://docs.recall.ai/docs/how-to-get-mixed-audio-async
 */
export async function getMixedAudioDownloadUrlForBot(
  botId: string
): Promise<string> {
  const bot = await fetchBot(botId)
  const recordingId = pickRecordingId(bot)

  const response = await fetch(
    `${env.RECALL_API_URL}/audio_mixed?recording_id=${encodeURIComponent(recordingId)}`,
    { method: "GET", headers: authHeaders() }
  )
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new WorkerRecallError(
      `Recall audio_mixed list failed (${response.status}): ${text || response.statusText}`,
      response.status
    )
  }

  const json = (await response.json()) as RecallMixedAudioListResponse
  for (const item of json.results ?? []) {
    if (item.status?.code === "done" && item.data?.download_url) {
      return item.data.download_url
    }
  }

  throw new WorkerRecallError("Recall mixed audio is not ready yet", 404)
}

/** Download mixed meeting audio bytes from a Recall presigned URL. */
export async function downloadMixedAudioBuffer(
  downloadUrl: string
): Promise<Buffer> {
  const response = await fetch(downloadUrl, { method: "GET" })
  if (!response.ok) {
    throw new WorkerRecallError(
      `Failed to download Recall mixed audio (${response.status})`,
      response.status
    )
  }
  return Buffer.from(await response.arrayBuffer())
}

export { WorkerRecallError }
