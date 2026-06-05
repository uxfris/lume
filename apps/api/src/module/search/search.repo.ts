import { prisma } from "@workspace/database"
import type { MeetingWithOwner } from "../meetings/meetings.repo"

type RankedRow = {
  meetingId: string
  chunkId: string | null
  score: number
}

export const searchRepo = {
  semanticSearch(input: {
    workspaceId: string
    embedding: number[]
    limit: number
    minScore: number
  }): Promise<RankedRow[]> {
    const vector = `[${input.embedding.join(",")}]`
    return prisma.$queryRaw<RankedRow[]>`
      SELECT
        mc."meetingId" AS "meetingId",
        mc.id AS "chunkId",
        1 - (mc.embedding <=> ${vector}::vector) AS score
      FROM "meeting_chunk" mc
      INNER JOIN "meeting" m ON m.id = mc."meetingId"
      WHERE
        m."workspaceId" = ${input.workspaceId}
        AND m."deletedAt" IS NULL
        AND (1 - (mc.embedding <=> ${vector}::vector)) >= ${input.minScore}
      ORDER BY mc.embedding <=> ${vector}::vector
      LIMIT ${input.limit}
    `
  },

  keywordSearch(input: {
    workspaceId: string
    query: string
    limit: number
    minScore: number
  }): Promise<RankedRow[]> {
    const q = input.query.trim()
    // Use word_similarity / <% (not similarity / %): full-string similarity is too
    // low when the query is a single word inside a longer title.
    return prisma.$queryRaw<RankedRow[]>`
      SELECT
        m.id AS "meetingId",
        NULL::text AS "chunkId",
        GREATEST(
          word_similarity(${q}, m.title),
          COALESCE(MAX(word_similarity(${q}, ts.text)), 0)
        ) AS score
      FROM "meeting" m
      LEFT JOIN "transcript_segment" ts ON ts."meetingId" = m.id
      WHERE
        m."workspaceId" = ${input.workspaceId}
        AND m."deletedAt" IS NULL
        AND (
          ${q} <% m.title
          OR ts.text IS NOT NULL AND ${q} <% ts.text
        )
      GROUP BY m.id
      HAVING GREATEST(
        word_similarity(${q}, m.title),
        COALESCE(MAX(word_similarity(${q}, ts.text)), 0)
      ) >= ${input.minScore}
      ORDER BY score DESC
      LIMIT ${input.limit}
    `
  },

  listMeetingsByIds(input: {
    workspaceId: string
    meetingIds: string[]
  }): Promise<MeetingWithOwner[]> {
    if (input.meetingIds.length === 0) return Promise.resolve([])
    return prisma.meeting.findMany({
      where: {
        id: { in: input.meetingIds },
        workspaceId: input.workspaceId,
        deletedAt: null,
      },
      include: { user: true, meetingParticipants: true },
    })
  },

  async ensureSearchIndexes(): Promise<void> {
    return prisma.$executeRaw`
      DO $$
      BEGIN
        IF (SELECT COUNT(*) FROM "meeting_chunk") > 1000 THEN
          CREATE INDEX IF NOT EXISTS meeting_chunk_embedding_ivfflat_idx
            ON "meeting_chunk" USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        END IF;
      END
      $$;
    `.then(() => {})
  },
}
