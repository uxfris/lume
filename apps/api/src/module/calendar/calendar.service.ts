import type {
  MeetingPlatform,
  UpcomingMeeting,
  UpcomingMeetingGroup,
} from "@workspace/types"
import { prisma } from "@workspace/database"
import { calendarRepo, type CalendarEventRow } from "./calendar.repo"
import { env } from "../../config/env"

const TEN_MINUTES = 10 * 60 * 1000

function initialsFromTitle(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "EV"
  if (parts.length === 1) return (parts[0] ?? "EV").slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] ?? "E"}${parts[1]?.[0] ?? "V"}`.toUpperCase()
}

function formatDuration(startAt: Date, endAt: Date): string {
  const minutes = Math.max(
    1,
    Math.round((endAt.getTime() - startAt.getTime()) / 60000)
  )
  return `${minutes}m`
}

function formatTimestamp(startAt: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(startAt)
}

function groupLabel(from: Date, value: Date): string {
  const startOfFrom = new Date(from)
  startOfFrom.setHours(0, 0, 0, 0)
  const startOfValue = new Date(value)
  startOfValue.setHours(0, 0, 0, 0)
  const diffDays = Math.round(
    (startOfValue.getTime() - startOfFrom.getTime()) / (24 * 60 * 60 * 1000)
  )
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(value)
}

function toDisplayPlatform(
  platform: CalendarEventRow["platform"]
): MeetingPlatform {
  if (platform === "ZOOM") return "Zoom"
  if (platform === "MICROSOFT_TEAMS") return "Teams"
  return "Google Meet"
}

function toDisplayAction(
  startAt: Date,
  joinUrl: string | null
): "join" | "view event" {
  // const canJoin = joinUrl && Date.now() >= startAt.getTime() - TEN_MINUTES

  // const action = canJoin ? "join" : "view event"
  // return action
  return "view event"
}

function toUpcomingMeeting(row: CalendarEventRow): UpcomingMeeting {
  return {
    id: row.id,
    title: row.title,
    timestamp: formatTimestamp(row.startAt),
    duration: formatDuration(row.startAt, row.endAt),
    platform: toDisplayPlatform(row.platform),
    action: toDisplayAction(row.startAt, row.joinUrl),
    meetingUrl: row.joinUrl,
    calendarUrl: row.calendarUrl,
    attendees: [
      {
        id: `calendar-${row.id}`,
        initials: initialsFromTitle(row.title),
      },
    ],
  }
}

export async function listUpcomingMeetings(input: {
  workspaceId: string
  days: number
  limit: number
}): Promise<UpcomingMeetingGroup[]> {
  const from = new Date()
  const to = new Date(from)
  to.setDate(to.getDate() + input.days)

  const rows = await calendarRepo.listUpcomingByWorkspace({
    workspaceId: input.workspaceId,
    from,
    to,
    take: input.limit,
  })

  const grouped = new Map<string, ReturnType<typeof toUpcomingMeeting>[]>()
  for (const row of rows) {
    const label = groupLabel(from, row.startAt)
    const existing = grouped.get(label) ?? []
    existing.push(toUpcomingMeeting(row))
    grouped.set(label, existing)
  }

  return Array.from(grouped.entries()).map(([label, meetings]) => ({
    label,
    meetings,
  }))
}

export type ConnectCalendarResult =
  | {
      ok: true
      calendarId: string
      provider: "google" | "microsoft"
      status: string
    }
  | {
      ok: false
      error:
        | "RECALL_NOT_CONFIGURED"
        | "ACCOUNT_NOT_CONNECTED"
        | "REFRESH_TOKEN_MISSING"
        | "CALENDAR_CONNECT_FAILED"
      message?: string
    }

export async function connectCalendar(input: {
  userId: string
  provider: "google" | "microsoft"
}): Promise<ConnectCalendarResult> {
  if (!env.RECALL_API_KEY) {
    return { ok: false, error: "RECALL_NOT_CONFIGURED" }
  }

  const existing = await prisma.recallCalendarConnection.findUnique({
    where: {
      userId_provider: {
        userId: input.userId,
        provider: input.provider,
      },
    },
  })
  if (existing) {
    return {
      ok: true,
      calendarId: existing.recallCalendarId,
      provider: input.provider,
      status: "already_connected",
    }
  }

  const account = await calendarRepo.findOAuthAccount({
    userId: input.userId,
    providerId: input.provider,
  })
  if (!account) {
    return { ok: false, error: "ACCOUNT_NOT_CONNECTED" }
  }
  if (!account.refreshToken) {
    return { ok: false, error: "REFRESH_TOKEN_MISSING" }
  }

  const body = {
    oauth_client_id:
      input.provider === "google"
        ? env.GOOGLE_CLIENT_ID
        : env.MICROSOFT_CLIENT_ID,
    oauth_client_secret:
      input.provider === "google"
        ? env.GOOGLE_CLIENT_SECRET
        : env.MICROSOFT_CLIENT_SECRET,
    oauth_refresh_token: account.refreshToken,
    platform:
      input.provider === "google" ? "google_calendar" : "microsoft_outlook",
  }

  const v2Base = (() => {
    const origin = new URL(env.RECALL_API_URL).origin
    return `${origin}/api/v2`
  })()

  const response = await fetch(`${v2Base}/calendars/`, {
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
    return {
      ok: false,
      error: "CALENDAR_CONNECT_FAILED",
      message: text || response.statusText,
    }
  }

  const json = (await response.json()) as { id?: string; status?: string }
  if (!json.id) {
    return {
      ok: false,
      error: "CALENDAR_CONNECT_FAILED",
      message: "Recall calendar response missing id",
    }
  }

  await prisma.recallCalendarConnection.create({
    data: {
      userId: input.userId,
      provider: input.provider,
      recallCalendarId: json.id,
    },
  })

  return {
    ok: true,
    calendarId: json.id,
    provider: input.provider,
    status: json.status ?? "connected",
  }
}

/**
 * Called after a new auth session is created (e.g. OAuth callback). Idempotent per user+provider.
 * Errors are swallowed — Recall misconfiguration must not block login.
 */
export async function syncRecallCalendarsForUser(
  userId: string
): Promise<void> {
  if (!env.RECALL_API_KEY) return

  const accounts = await prisma.account.findMany({
    where: {
      userId,
      providerId: { in: ["google", "microsoft"] },
      refreshToken: { not: null },
    },
    select: { providerId: true },
  })

  for (const row of accounts) {
    if (row.providerId !== "google" && row.providerId !== "microsoft") continue
    await connectCalendar({
      userId,
      provider: row.providerId,
    }).catch(() => {})
  }
}
