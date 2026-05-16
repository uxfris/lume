import type { Attendee } from "@workspace/types"
import type { Prisma } from "@workspace/database"

/**
 * Deduped people (creator / organizer / attendees) from Google Calendar or
 * Microsoft Graph event JSON (`RecallCalendarEventRecord.raw` or the same
 * object stored in `CalendarEvent.metadata`).
 */
export function providerPeopleFromProviderRaw(
  raw: unknown
): Array<{ email?: string; name?: string }> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return []
  }
  const rec = raw as Record<string, unknown>
  if (isMicrosoftGraphEventShape(rec)) {
    return peopleFromMicrosoftEvent(rec)
  }
  return peopleFromGoogleEvent(rec)
}

function normalizeEmail(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined
  const e = input.trim().toLowerCase()
  return e || undefined
}

function normalizeName(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined
  const n = input.trim()
  return n || undefined
}

function isMicrosoftGraphEventShape(raw: Record<string, unknown>): boolean {
  const org = raw.organizer
  if (org && typeof org === "object" && "emailAddress" in org) return true
  const attendees = raw.attendees
  if (!Array.isArray(attendees) || attendees.length === 0) return false
  const first = attendees[0]
  return (
    first != null &&
    typeof first === "object" &&
    "emailAddress" in (first as Record<string, unknown>)
  )
}

function readMicrosoftRecipient(
  input: unknown
): { email?: string; name?: string } | null {
  if (!input || typeof input !== "object") return null
  const ea = (input as Record<string, unknown>).emailAddress
  if (!ea || typeof ea !== "object") return null
  const rec = ea as Record<string, unknown>
  const address = normalizeEmail(rec.address)
  const name = normalizeName(rec.name)
  if (!address && !name) return null
  return { email: address, name }
}

function readGooglePerson(input: unknown): { email?: string; name?: string } | null {
  if (!input || typeof input !== "object") return null
  const rec = input as Record<string, unknown>
  const email = normalizeEmail(rec.email)
  const name = normalizeName(rec.displayName)
  if (!email && !name) return null
  return { email, name }
}

function dedupeKey(p: { email?: string; name?: string }): string {
  if (p.email) return p.email.toLowerCase()
  if (p.name) return `name:${p.name.trim().toLowerCase()}`
  return ""
}

function pushUnique(
  out: Array<{ email?: string; name?: string }>,
  seen: Set<string>,
  p: { email?: string; name?: string } | null
) {
  if (!p) return
  const key = dedupeKey(p)
  if (!key || seen.has(key)) return
  seen.add(key)
  out.push(p)
}

function peopleFromMicrosoftEvent(raw: Record<string, unknown>) {
  const out: Array<{ email?: string; name?: string }> = []
  const seen = new Set<string>()

  const createdBy = raw.createdBy
  if (createdBy && typeof createdBy === "object") {
    const user = (createdBy as Record<string, unknown>).user
    pushUnique(out, seen, readMicrosoftRecipient(user))
  }

  pushUnique(out, seen, readMicrosoftRecipient(raw.organizer))

  const attendees = raw.attendees
  if (Array.isArray(attendees)) {
    for (const a of attendees) {
      if (!a || typeof a !== "object") continue
      const rec = a as Record<string, unknown>
      const status = rec.status
      if (status && typeof status === "object") {
        const response = (status as Record<string, unknown>).response
        if (response === "declined") continue
      }
      pushUnique(out, seen, readMicrosoftRecipient(a))
    }
  }

  return out
}

function peopleFromGoogleEvent(raw: Record<string, unknown>) {
  const out: Array<{ email?: string; name?: string }> = []
  const seen = new Set<string>()

  pushUnique(out, seen, readGooglePerson(raw.creator))
  pushUnique(out, seen, readGooglePerson(raw.organizer))

  const attendees = raw.attendees
  if (Array.isArray(attendees)) {
    for (const a of attendees) {
      if (!a || typeof a !== "object") continue
      const rec = a as Record<string, unknown>
      if (rec.responseStatus === "declined") continue
      pushUnique(out, seen, readGooglePerson(a))
    }
  }

  return out
}

export function initialsFromTitle(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "EV"
  if (parts.length === 1) return (parts[0] ?? "EV").slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] ?? "E"}${parts[1]?.[0] ?? "V"}`.toUpperCase()
}

function avatarUrlIfValid(image: string | null | undefined): string | undefined {
  if (!image || typeof image !== "string") return undefined
  const t = image.trim()
  if (t.startsWith("https://") || t.startsWith("http://")) return t
  return undefined
}

function stableAttendeeId(
  externalId: string,
  person: { email?: string; name?: string },
  index: number
): string {
  if (person.email) return `email:${person.email.toLowerCase()}`
  if (person.name) return `name:${person.name.trim().toLowerCase()}`
  return `calendar-${externalId}-guest-${index}`
}

/**
 * Dedupe keys (email:… / name:…) for people who are the meeting organizer
 * per provider payload (Google Calendar event vs Microsoft Graph event).
 *
 * @see https://developers.google.com/workspace/calendar/api/v3/reference/events#resource
 * @see https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0#properties
 */
function hostDedupeKeysFromRaw(raw: unknown): Set<string> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return new Set()
  }
  const rec = raw as Record<string, unknown>
  if (isMicrosoftGraphEventShape(rec)) {
    const keys = new Set<string>()
    const org = readMicrosoftRecipient(rec.organizer)
    if (org) {
      const k = dedupeKey(org)
      if (k) keys.add(k)
    }
    return keys
  }
  const keys = new Set<string>()
  const mainOrg = readGooglePerson(rec.organizer)
  if (mainOrg) {
    const k = dedupeKey(mainOrg)
    if (k) keys.add(k)
  }
  const attendees = rec.attendees
  if (Array.isArray(attendees)) {
    for (const a of attendees) {
      if (!a || typeof a !== "object") continue
      const ar = a as Record<string, unknown>
      if (ar.organizer === true) {
        const p = readGooglePerson(a)
        if (p) {
          const k = dedupeKey(p)
          if (k) keys.add(k)
        }
      }
    }
  }
  return keys
}

/**
 * Full attendee list for `calendar_event.attendees` (API-ready shape).
 * Built at webhook ingest time from provider `raw` + calendar owner profile.
 */
export function buildCalendarEventAttendeesJson(input: {
  raw: unknown
  externalId: string
  owner: { email: string | null; name: string | null; image: string | null }
  fallbackTitle: string
}): Prisma.InputJsonValue {
  const hostKeys = hostDedupeKeysFromRaw(input.raw)
  let people = providerPeopleFromProviderRaw(input.raw)

  if (people.length === 0) {
    people = [
      {
        email: input.owner.email ?? undefined,
        name: input.owner.name ?? undefined,
      },
    ]
  }

  const only = people[0]
  if (
    people.length === 1 &&
    only &&
    !only.email &&
    !only.name
  ) {
    return [
      {
        id: `calendar-${input.externalId}`,
        initials: initialsFromTitle(input.fallbackTitle),
        isHost: true,
      },
    ] as unknown as Prisma.InputJsonValue
  }

  const attendees: Attendee[] = people.map((p, i) => {
    const id = stableAttendeeId(input.externalId, p, i)
    const initials = initialsFromPerson(p.name ?? null, p.email ?? null)
    const isHost = hostKeys.has(dedupeKey(p))
    const row: Attendee = { id, initials, isHost }
    return row
  })

  const ownerEmail = input.owner.email?.trim().toLowerCase()
  if (ownerEmail) {
    const idx = attendees.findIndex((a) => a.id === `email:${ownerEmail}`)
    if (idx >= 0) {
      const url = avatarUrlIfValid(input.owner.image)
      if (url) attendees[idx] = { ...attendees[idx]!, avatarUrl: url }
    }
  }

  return attendees as unknown as Prisma.InputJsonValue
}

export function initialsFromPerson(name?: string | null, email?: string | null): string {
  const n = (name ?? "").trim()
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase() || "?"
    }
    if (parts.length === 1) {
      const w = parts[0] ?? ""
      return (w.length >= 2 ? w.slice(0, 2) : `${w}X`).toUpperCase()
    }
  }
  const e = (email ?? "").trim()
  if (e) {
    const local = e.split("@")[0] ?? e
    const letters = local.replace(/[^a-zA-Z]/g, "")
    if (letters.length >= 2) return letters.slice(0, 2).toUpperCase()
    if (local.length >= 2) return local.slice(0, 2).toUpperCase()
    return e.slice(0, 2).toUpperCase()
  }
  return "?"
}
