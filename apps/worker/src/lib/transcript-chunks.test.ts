import { describe, expect, it } from "vitest"
import { chunkSegmentsForEmbedding, type SegmentRow } from "./transcript-chunks"

function seg(
  text: string,
  startMs: number,
  endMs: number,
  speaker: string | null = "Alice"
): SegmentRow {
  return { text, startMs, endMs, speaker }
}

describe("chunkSegmentsForEmbedding", () => {
  it("returns an empty array for empty input", () => {
    expect(chunkSegmentsForEmbedding([])).toEqual([])
  })

  it("packs short segments into a single chunk and preserves time bounds", () => {
    const chunks = chunkSegmentsForEmbedding([
      seg("hello", 0, 1_000, "Alice"),
      seg("world", 1_000, 2_500, "Bob"),
    ])

    expect(chunks).toHaveLength(1)
    expect(chunks[0]?.startMs).toBe(0)
    expect(chunks[0]?.endMs).toBe(2_500)
    expect(chunks[0]?.content).toContain("Alice: hello")
    expect(chunks[0]?.content).toContain("Bob: world")
  })

  it("splits when a chunk would exceed ~500 token / 2000 char budget", () => {
    const longText = "a".repeat(900)
    const segments: SegmentRow[] = [
      seg(longText, 0, 1_000),
      seg(longText, 1_000, 2_000),
      seg(longText, 2_000, 3_000),
    ]

    const chunks = chunkSegmentsForEmbedding(segments)
    expect(chunks.length).toBeGreaterThan(1)
    for (const c of chunks) {
      expect(c.content.length).toBeLessThanOrEqual(2_000 + 100)
    }
    expect(chunks[chunks.length - 1]!.endMs).toBe(3_000)
  })

  it("falls back to 'Speaker' label when speaker is null/blank", () => {
    const chunks = chunkSegmentsForEmbedding([
      seg("hi", 0, 100, null),
      seg("there", 100, 200, "  "),
    ])

    expect(chunks[0]?.content).toContain("Speaker: hi")
    expect(chunks[0]?.content).toContain("Speaker: there")
  })
})
