import { createHmac, timingSafeEqual } from "node:crypto"
import type { MeetingPlatform } from "@workspace/database"
import { env } from "../config/env"

const PLATFORM_PATTERNS: Array<{
  platform: MeetingPlatform
  matches: (url: URL) => boolean
}> = [
  {
    platform: "ZOOM",
    matches: (url) => /(?:^|\.)zoom\.us$/i.test(url.hostname),
  },
  {
    platform: "GOOGLE_MEET",
    matches: (url) => /(?:^|\.)meet\.google\.com$/i.test(url.hostname),
  },
  {
    platform: "MICROSOFT_TEAMS",
    matches: (url) =>
      /(?:^|\.)teams\.microsoft\.com$/i.test(url.hostname) ||
      /(?:^|\.)teams\.live\.com$/i.test(url.hostname),
  },
]

/** Detect the conferencing platform from a meeting join URL. */
export function detectPlatform(meetingUrl: string): MeetingPlatform {
  let url: URL
  try {
    url = new URL(meetingUrl)
  } catch {
    return "OTHER"
  }
  for (const candidate of PLATFORM_PATTERNS) {
    if (candidate.matches(url)) return candidate.platform
  }
  return "OTHER"
}

export interface DispatchBotInput {
  meetingUrl: string
  /**
   * Our internal meeting id, round-tripped via `metadata.meeting_id`.
   * Recall echoes `metadata` back in every status webhook so we can recover
   * the meeting without relying on `data.bot.id` lookup.
   */
  meetingId: string
  /** ISO 8601; only set for scheduled bots (>=10 min in the future). */
  joinAt?: string
  /** Optional opt-in real-time transcript webhook. Must be a public HTTPS URL. */
  realtimeWebhookUrl?: string
}

export interface DispatchBotResult {
  botId: string
  rawResponse: unknown
}

/**
 * Build the recording config for bot creation.
 *
 * Default mode (no realtime endpoint):
 * - async-first: we wait for `recording.done`, then explicitly call
 *   `recording/{id}/create_transcript/` with `recallai_async`.
 *
 * Realtime mode (realtime endpoint provided):
 * - use `recallai_streaming` + `realtime_endpoints` so we can receive
 *   `transcript.data` during the meeting.
 */
function buildRecordingConfig(input: {
  meetingId: string
  realtimeWebhookUrl?: string
}): Record<string, unknown> {
  const recordingConfig: Record<string, unknown> = {
    metadata: { meeting_id: input.meetingId },
  }

  if (input.realtimeWebhookUrl) {
    recordingConfig.transcript = {
      provider: {
        recallai_streaming: {
          mode: "prioritize_accuracy",
          language_code: "auto",
        },
      },
      diarization: {
        use_separate_streams_when_available: true,
      },
      metadata: {
        meeting_id: input.meetingId,
      },
    }
    recordingConfig.realtime_endpoints = [
      {
        type: "webhook",
        url: input.realtimeWebhookUrl,
        events: ["transcript.data", "transcript.partial_data"],
        metadata: { meeting_id: input.meetingId },
      },
    ]
  }

  return recordingConfig
}

/**
 * Start an async transcript job for a completed recording.
 *
 * Flow:
 * 1) receive `recording.done` webhook
 * 2) call this endpoint with `recallai_async`
 * 3) wait for `transcript.done` / `transcript.failed`
 */
export async function createAsyncTranscriptForRecording(input: {
  recordingId: string
  meetingId: string
}): Promise<{ transcriptId: string | null }> {
  if (!env.RECALL_API_KEY) {
    throw new RecallNotConfiguredError(
      "Recall.ai is not configured: set RECALL_API_KEY."
    )
  }

  const response = await fetch(
    `${env.RECALL_API_URL}/recording/${input.recordingId}/create_transcript/`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${env.RECALL_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        provider: {
          recallai_async: {},
        },
        diarization: {
          use_separate_streams_when_available: true,
        },
        metadata: {
          meeting_id: input.meetingId,
        },
      }),
    }
  )

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new RecallApiError(
      `Recall create_transcript failed (${response.status}): ${text || response.statusText}`,
      response.status
    )
  }

  const json = (await response.json()) as { id?: string }
  return { transcriptId: json.id ?? null }
}

/**
 * Dispatch a Recall bot to a live (or scheduled) call.
 *
 * Notes:
 * - Recall accepts both `Authorization: <key>` and `Authorization: Token <key>`.
 *   We send the prefixed form for forward-compatibility with older accounts.
 * - We round-trip our internal meeting id via `metadata.meeting_id` because
 *   Recall has no top-level `external_id` field.
 */
export async function dispatchBot(
  input: DispatchBotInput
): Promise<DispatchBotResult> {
  if (!env.RECALL_API_KEY) {
    throw new RecallNotConfiguredError(
      "Recall.ai is not configured: set RECALL_API_KEY."
    )
  }

  const body: Record<string, unknown> = {
    meeting_url: input.meetingUrl,
    bot_name: env.RECALL_BOT_NAME,
    metadata: { meeting_id: input.meetingId },
    recording_config: buildRecordingConfig({
      meetingId: input.meetingId,
      realtimeWebhookUrl: input.realtimeWebhookUrl,
    }),
  }
  if (input.joinAt) body.join_at = input.joinAt

  const response = await fetch(`${env.RECALL_API_URL}/bot`, {
    method: "POST",
    headers: {
      Authorization: `Token ${env.RECALL_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new RecallApiError(
      `Recall dispatch failed (${response.status}): ${text || response.statusText}`,
      response.status
    )
  }

  const json = (await response.json()) as { id?: string }
  if (!json.id) {
    throw new RecallApiError("Recall dispatch response missing bot id", 502)
  }

  return { botId: json.id, rawResponse: json }
}

/**
 * Verify an inbound Recall request signature.
 *
 * Recall sends `webhook-id`, `webhook-timestamp`, and `webhook-signature`
 * headers (with `svix-*` as a legacy fallback). The signature is HMAC-SHA256
 * over `${id}.${timestamp}.${rawBody}`, base64-encoded, and the header may
 * contain a space-separated list of `v1,<sig>` entries to support secret
 * rotation. Secrets are issued in the `whsec_<base64>` format.
 *
 * Same scheme is used for both Svix dashboard webhooks (status changes) and
 * real-time endpoints when a workspace verification secret is configured.
 *
 * For GET / WebSocket-upgrade requests `rawBody` should be an empty string.
 */
export function verifyRecallSignature(params: {
  rawBody: string | Buffer
  headers: Record<string, string | string[] | undefined>
  /** Optional override for tests; defaults to env.RECALL_WEBHOOK_SECRET. */
  secret?: string
  /** Tolerance window for the timestamp, in seconds. Default 5 minutes. */
  toleranceSeconds?: number
  /** Current time in seconds since epoch (test override). */
  nowSeconds?: number
}): { ok: true } | { ok: false; reason: string } {
  const secret = params.secret ?? env.RECALL_WEBHOOK_SECRET
  if (!secret) return { ok: false, reason: "RECALL_WEBHOOK_SECRET not set" }

  const id =
    pickHeader(params.headers, "webhook-id") ??
    pickHeader(params.headers, "svix-id")
  const ts =
    pickHeader(params.headers, "webhook-timestamp") ??
    pickHeader(params.headers, "svix-timestamp")
  const sigHeader =
    pickHeader(params.headers, "webhook-signature") ??
    pickHeader(params.headers, "svix-signature")

  if (!id || !ts || !sigHeader) {
    return { ok: false, reason: "missing webhook headers" }
  }

  const tolerance = params.toleranceSeconds ?? 5 * 60
  const now = params.nowSeconds ?? Math.floor(Date.now() / 1000)
  const tsNumeric = Number.parseInt(ts, 10)
  if (!Number.isFinite(tsNumeric)) {
    return { ok: false, reason: "invalid webhook-timestamp" }
  }
  if (Math.abs(now - tsNumeric) > tolerance) {
    return { ok: false, reason: "stale or future-dated webhook" }
  }

  const rawBody =
    typeof params.rawBody === "string"
      ? params.rawBody
      : params.rawBody.toString("utf8")

  const keyBytes = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice("whsec_".length), "base64")
    : Buffer.from(secret, "utf8")

  const toSign = `${id}.${ts}.${rawBody}`
  const expected = createHmac("sha256", keyBytes)
    .update(toSign)
    .digest("base64")

  // Per docs, multiple signatures are space-separated; tolerate newlines too.
  const candidates = sigHeader
    .split(/\s+/)
    .filter(Boolean)
    .map((entry) => {
      const [version, value] = entry.split(",", 2)
      return value && version === "v1" ? value : null
    })
    .filter((s): s is string => !!s)

  if (candidates.length === 0) {
    return { ok: false, reason: "no v1 signatures present" }
  }

  const expectedBuf = Buffer.from(expected, "base64")
  for (const candidate of candidates) {
    const candidateBuf = Buffer.from(candidate, "base64")
    if (candidateBuf.length !== expectedBuf.length) continue
    if (timingSafeEqual(candidateBuf, expectedBuf)) {
      return { ok: true }
    }
  }
  return { ok: false, reason: "signature mismatch" }
}

function pickHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  // Headers may arrive lowercased or capitalised depending on the framework.
  const lowered = headers[name] ?? headers[name.toLowerCase()]
  if (Array.isArray(lowered)) return lowered[0]
  return lowered
}

export class RecallNotConfiguredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RecallNotConfiguredError"
  }
}

export class RecallApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "RecallApiError"
    this.status = status
  }
}
