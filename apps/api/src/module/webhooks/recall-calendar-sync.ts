import { Prisma, prisma } from "@workspace/database"

import { env } from "../../config/env"
import type {
  RecallCalendarEventRecord,
  RecallStatusEnvelope,
} from "./recall-webhook.types"

function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null
  const email = input.trim().toLowerCase()
  return email || null
}

/**
 * Browser link to the event in the provider calendar UI.
 * Google Calendar uses `htmlLink`; Microsoft Graph uses `webLink`.
 * Falls back to the meeting join URL when neither is present (DB requires a non-null string).
 */
function calendarWebUrlFromRaw(
  raw: unknown,
  fallbackJoinUrl?: string | null
): string {
  if (!raw || typeof raw !== "object") {
    const fb = typeof fallbackJoinUrl === "string" ? fallbackJoinUrl.trim() : ""
    return fb || ""
  }
  const rec = raw as Record<string, unknown>
  const htmlLink = rec.htmlLink
  if (typeof htmlLink === "string" && htmlLink.trim()) return htmlLink.trim()
  const webLink = rec.webLink
  if (typeof webLink === "string" && webLink.trim()) return webLink.trim()
  const fb = typeof fallbackJoinUrl === "string" ? fallbackJoinUrl.trim() : ""
  return fb || ""
}

function readRawEmail(
  raw: unknown,
  key: "creator" | "organizer"
): string | null {
  if (!raw || typeof raw !== "object") return null
  const value = (raw as Record<string, unknown>)[key]
  if (!value || typeof value !== "object") return null
  return normalizeEmail((value as Record<string, unknown>).email)
}

function extractCalendarOwnerEmail(
  calendarEvent: RecallCalendarEventRecord
): string | null {
  return (
    normalizeEmail(calendarEvent.calendar?.oauth_email) ??
    normalizeEmail(calendarEvent.calendar?.platform_email) ??
    readRawEmail(calendarEvent.raw, "organizer") ??
    readRawEmail(calendarEvent.raw, "creator")
  )
}

async function resolveCalendarEventOwner(
  calendarEvent: RecallCalendarEventRecord
) {
  if (calendarEvent.calendar_id) {
    const connection = await prisma.recallCalendarConnection.findFirst({
      where: { recallCalendarId: calendarEvent.calendar_id },
      select: { userId: true },
    })
    if (connection) return { id: connection.userId }
  }

  const ownerEmail = extractCalendarOwnerEmail(calendarEvent)
  if (!ownerEmail) return null

  return prisma.user.findUnique({
    where: { email: ownerEmail },
    select: { id: true },
  })
}

function getRecallHeaders() {
  if (!env.RECALL_API_KEY) {
    throw new Error("RECALL_API_KEY is required for Calendar V2 webhook sync")
  }
  return {
    Authorization: `Token ${env.RECALL_API_KEY}`,
    Accept: "application/json",
  }
}

function getRecallV2BaseUrl(): string {
  const origin = new URL(env.RECALL_API_URL).origin
  return `${origin}/api/v2`
}

function toMeetingPlatform(input?: string | null) {
  const raw = input?.toLowerCase() ?? ""
  if (raw.includes("zoom")) return "ZOOM" as const
  if (raw.includes("teams")) return "MICROSOFT_TEAMS" as const
  if (raw.includes("meet")) return "GOOGLE_MEET" as const
  return "OTHER" as const
}

async function fetchChangedCalendarEvents(input: {
  calendarId: string
  lastUpdatedTs: string
}): Promise<RecallCalendarEventRecord[]> {
  const out: RecallCalendarEventRecord[] = []
  const baseUrl =
    `${getRecallV2BaseUrl()}/calendar-events/?calendar_id=${encodeURIComponent(input.calendarId)}` +
    `&updated_at__gte=${encodeURIComponent(input.lastUpdatedTs)}`
  let nextUrl: string | null = baseUrl

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers: getRecallHeaders() })
    if (!response.ok) {
      const text = await response.text().catch(() => "")
      throw new Error(
        `Recall calendar_event list failed (${response.status}): ${text || response.statusText}`
      )
    }

    const json = (await response.json()) as {
      results?: RecallCalendarEventRecord[]
      next?: string | null
      calendar_events?: RecallCalendarEventRecord[]
      next_cursor?: string | null
    }

    if (Array.isArray(json.results)) out.push(...json.results)
    if (Array.isArray(json.calendar_events)) out.push(...json.calendar_events)

    if (json.next) {
      nextUrl = json.next
      continue
    }
    if (json.next_cursor) {
      nextUrl = `${baseUrl}&cursor=${encodeURIComponent(json.next_cursor)}`
      continue
    }
    nextUrl = null
  }

  return out
}

async function scheduleBotForCalendarEvent(event: RecallCalendarEventRecord) {
  if (!env.RECALL_API_KEY) return
  if (event.is_deleted) return
  if (!event.meeting_url) return

  const startAt = new Date(event.start_time)
  if (!Number.isFinite(startAt.getTime()) || startAt.getTime() <= Date.now()) {
    return
  }

  const deduplicationKey = `${event.start_time}-${event.meeting_url}`
  const response = await fetch(
    `${getRecallV2BaseUrl()}/calendar-events/${event.id}/bot/`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${env.RECALL_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        deduplication_key: deduplicationKey,
        bot_config: {
          bot_name: env.RECALL_BOT_NAME,
          join_at: event.start_time,
        },
      }),
    }
  )
  if (!response.ok && response.status !== 409) {
    throw new Error(
      `failed to schedule calendar event bot (${response.status}): ${await response.text().catch(() => response.statusText)}`
    )
  }
}

async function unscheduleBotForCalendarEvent(event: RecallCalendarEventRecord) {
  if (!env.RECALL_API_KEY) return
  if (!event.is_deleted) return
  const response = await fetch(
    `${getRecallV2BaseUrl()}/calendar-events/${event.id}/bot/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${env.RECALL_API_KEY}`,
        Accept: "application/json",
      },
    }
  )
  if (!response.ok && response.status !== 404) {
    throw new Error(
      `failed to unschedule calendar event bot (${response.status}): ${await response.text().catch(() => response.statusText)}`
    )
  }
}

async function upsertCalendarEventRecord(
  calendarEvent: RecallCalendarEventRecord
): Promise<boolean> {
  const user = await resolveCalendarEventOwner(calendarEvent)
  if (!user) return false

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    select: { workspaceId: true },
  })
  if (memberships.length === 0) return false

  const startAt = new Date(calendarEvent.start_time)
  const endAt = new Date(calendarEvent.end_time)
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return false
  }

  for (const membership of memberships) {
    if (calendarEvent.is_deleted) {
      await prisma.calendarEvent.deleteMany({
        where: {
          workspaceId: membership.workspaceId,
          userId: user.id,
          provider: "recall_v2",
          externalId: calendarEvent.id,
        },
      })
      continue
    }

    const rawObj =
      calendarEvent.raw && typeof calendarEvent.raw === "object"
        ? (calendarEvent.raw as Record<string, unknown>)
        : null
    const title =
      (typeof rawObj?.summary === "string" ? rawObj.summary.trim() : "") ||
      (typeof rawObj?.subject === "string" ? rawObj.subject.trim() : "") ||
      "Scheduled meeting"

    await prisma.calendarEvent.upsert({
      where: {
        workspaceId_userId_provider_externalId: {
          workspaceId: membership.workspaceId,
          userId: user.id,
          provider: "recall_v2",
          externalId: calendarEvent.id,
        },
      },
      create: {
        workspaceId: membership.workspaceId,
        userId: user.id,
        provider: "recall_v2",
        externalId: calendarEvent.id,
        title,
        startAt,
        endAt,
        joinUrl: calendarEvent.meeting_url ?? null,
        calendarUrl: calendarWebUrlFromRaw(
          calendarEvent.raw,
          calendarEvent.meeting_url
        ),
        platform: toMeetingPlatform(
          calendarEvent.meeting_platform ?? calendarEvent.platform
        ),
        metadata: (calendarEvent.raw ?? calendarEvent) as Prisma.InputJsonValue,
      },
      update: {
        title,
        startAt,
        endAt,
        joinUrl: calendarEvent.meeting_url ?? null,
        calendarUrl: calendarWebUrlFromRaw(
          calendarEvent.raw,
          calendarEvent.meeting_url
        ),
        platform: toMeetingPlatform(
          calendarEvent.meeting_platform ?? calendarEvent.platform
        ),
        metadata: (calendarEvent.raw ?? calendarEvent) as Prisma.InputJsonValue,
      },
    })
  }
  return true
}

export async function handleCalendarSyncEvent(
  payload: unknown
): Promise<boolean> {
  if (!payload || typeof payload !== "object") return false
  const root = payload as RecallStatusEnvelope
  const calendarId = root.data?.calendar_id ?? root.data?.calendar?.id
  const lastUpdatedTs = root.data?.last_updated_ts
  if (!calendarId || !lastUpdatedTs) return false

  const changed = await fetchChangedCalendarEvents({
    calendarId,
    lastUpdatedTs,
  })
  let handled = false

  for (const evt of changed) {
    const didHandle = await upsertCalendarEventRecord(evt)
    // Calendar V2 scheduling policy: keep one bot per meeting url + start time.
    if (evt.is_deleted) {
      await unscheduleBotForCalendarEvent(evt)
    } else {
      await scheduleBotForCalendarEvent(evt)
    }
    handled = handled || didHandle
  }
  return handled
}
