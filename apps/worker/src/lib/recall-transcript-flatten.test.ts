import { describe, expect, it } from "vitest"
import type { RecallTranscriptParticipantBlock } from "./recall"
import {
  flattenRecallTranscript,
  splitWordBufferIntoSegments,
} from "./recall-transcript-flatten"

function word(
  text: string,
  start: number,
  end = start + 0.2
): RecallTranscriptParticipantBlock["words"][number] {
  return {
    text,
    start_timestamp: { absolute: null, relative: start },
    end_timestamp: { absolute: null, relative: end },
  }
}

function block(
  participantId: number,
  name: string,
  words: RecallTranscriptParticipantBlock["words"]
): RecallTranscriptParticipantBlock {
  return {
    participant: {
      id: participantId,
      name,
      is_host: false,
      platform: "zoom",
      extra_data: null,
      email: null,
    },
    language_code: "en",
    words,
  }
}

describe("splitWordBufferIntoSegments", () => {
  it("splits on sentence-ending punctuation", () => {
    const chunks = splitWordBufferIntoSegments([
      { text: "Hello", startMs: 0, endMs: 200 },
      { text: "world.", startMs: 300, endMs: 800 },
      { text: "How", startMs: 900, endMs: 1000 },
      { text: "are", startMs: 1100, endMs: 1200 },
      { text: "you?", startMs: 1300, endMs: 1500 },
    ])

    expect(chunks).toHaveLength(2)
    expect(chunks[0]?.map((w) => w.text).join(" ")).toBe("Hello world.")
    expect(chunks[1]?.map((w) => w.text).join(" ")).toBe("How are you?")
  })

  it("splits when word count exceeds the cap", () => {
    const words = Array.from({ length: 20 }, (_, i) => ({
      text: `w${i}`,
      startMs: i * 100,
      endMs: i * 100 + 80,
    }))

    const chunks = splitWordBufferIntoSegments(words)
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.flat()).toHaveLength(20)
  })
})

describe("flattenRecallTranscript", () => {
  it("produces multiple segments for one long speaker turn without long pauses", () => {
    const segments = flattenRecallTranscript([
      block(1, "Alice", [
        word("Hello", 0),
        word("there.", 0.3),
        word("Nice", 0.5),
        word("to", 0.7),
        word("meet", 0.9),
        word("you.", 1.1),
      ]),
    ])

    expect(segments).toHaveLength(2)
    expect(segments[0]?.text).toBe("Hello there.")
    expect(segments[1]?.text).toBe("Nice to meet you.")
    expect(segments[0]?.words).toHaveLength(2)
    expect(segments[1]?.words).toHaveLength(4)
  })

  it("still splits on utterance pauses before phrase splitting", () => {
    const segments = flattenRecallTranscript([
      block(1, "Alice", [
        word("First", 0),
        word("sentence.", 0.4),
        word("Second", 3),
        word("sentence.", 3.4),
      ]),
    ])

    expect(segments).toHaveLength(2)
    expect(segments[0]?.text).toBe("First sentence.")
    expect(segments[1]?.text).toBe("Second sentence.")
  })

  it("sorts words and segments globally by start time", () => {
    const segments = flattenRecallTranscript([
      block(2, "Bob", [word("Later", 5), word("line.", 5.3)]),
      block(1, "Alice", [word("Earlier", 1), word("line.", 1.3)]),
    ])

    expect(segments.map((s) => s.text)).toEqual(["Earlier line.", "Later line."])
    expect(segments.map((s) => s.index)).toEqual([0, 1])
  })
})
