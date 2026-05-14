import type { MeetingPlatform, MeetingSource, MeetingStatus } from "@prisma/client"
import { prisma } from "../src/client"

/**
 * Local dev seed: creates 50 meetings for an existing user.
 * Re-running removes prior rows with titles prefixed by `[seed]` for this user, then inserts fresh rows.
 */
const SEED_USER_ID = "tniy3y7mxfiYHP0twsh5OXz6NZKMfSCz"
const MEETING_COUNT = 50

const STATUSES: MeetingStatus[] = [
  "SUMMARIZED",
  "TRANSCRIBED",
  "UPLOADED",
  "ANALYZING",
]

const PLATFORMS: MeetingPlatform[] = [
  "GOOGLE_MEET",
  "ZOOM",
  "MICROSOFT_TEAMS",
  "OTHER",
]

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: SEED_USER_ID },
    select: { id: true },
  })
  if (!user) {
    throw new Error(`User not found: ${SEED_USER_ID}`)
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: SEED_USER_ID },
    select: { workspaceId: true },
    orderBy: { joinedAt: "asc" },
  })
  if (!membership) {
    throw new Error(
      `No workspace membership for user ${SEED_USER_ID}. Join a workspace before seeding meetings.`,
    )
  }

  const { workspaceId } = membership
  const now = Date.now()

  await prisma.$transaction([
    prisma.meeting.deleteMany({
      where: {
        userId: SEED_USER_ID,
        title: { startsWith: "[seed] " },
      },
    }),
    prisma.meeting.createMany({
      data: Array.from({ length: MEETING_COUNT }, (_, i) => {
        const source: MeetingSource = i % 3 === 0 ? "BOT" : "UPLOAD"
        return {
          workspaceId,
          userId: SEED_USER_ID,
          title: `[seed] Meeting ${String(i + 1).padStart(2, "0")}`,
          status: STATUSES[i % STATUSES.length],
          source,
          platform: PLATFORMS[i % PLATFORMS.length],
          isStarred: i % 11 === 0,
          durationSeconds: 600 + ((i * 37) % 3600),
          meetingUrl:
            source === "BOT"
              ? `https://example.com/meet/seed-${i + 1}`
              : null,
          createdAt: new Date(now - i * 86_400_000 - i * 3_600_000),
        }
      }),
    }),
  ])

  console.log(
    `Seeded ${MEETING_COUNT} meetings for user ${SEED_USER_ID} in workspace ${workspaceId}.`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
