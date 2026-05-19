import type { RecallTranscriptParticipantBlock } from "./recall"

export interface FlatSegment {
  index: number
  participantExternalId: string | null
  participantName: string | null
  participantEmail: string | null
  participantIsHost: boolean | null
  participantPlatform: string | null
  participantExtraData: unknown
  languageCode: string | null
  text: string
  startMs: number
  endMs: number
  words: Array<{
    text: string
    startMs: number
    endMs: number
    position: number
  }>
}

type BufferedWord = {
  text: string
  startMs: number
  endMs: number
}

/** Pause between words that starts a new utterance (matches Recall realtime chunks). */
const UTTERANCE_GAP_MS = 1500

/** Cap segment size so UI hover targets stay phrase-sized (similar to Whisper segments). */
const MAX_SEGMENT_WORDS = 16
const MAX_SEGMENT_DURATION_MS = 10_000

function endsSentence(text: string): boolean {
  return /[.!?](?:['")\]]*)?$/.test(text.trim())
}

function wordTimestampsMs(word: RecallTranscriptParticipantBlock["words"][number]) {
  const startMs = (word.start_timestamp.relative ?? 0) * 1000
  const endMs =
    (word.end_timestamp?.relative ?? word.start_timestamp.relative ?? 0) * 1000
  return { startMs, endMs }
}

/**
 * Split a contiguous word run into smaller segments at sentence boundaries and
 * size limits so the meeting transcript UI can highlight phrase-sized chunks.
 */
export function splitWordBufferIntoSegments(
  words: BufferedWord[]
): BufferedWord[][] {
  if (words.length === 0) return []

  const segments: BufferedWord[][] = []
  let current: BufferedWord[] = []

  const flush = () => {
    if (current.length === 0) return
    segments.push(current)
    current = []
  }

  for (const word of words) {
    current.push(word)
    const durationMs = word.endMs - (current[0]?.startMs ?? word.startMs)
    const shouldFlush =
      endsSentence(word.text) ||
      current.length >= MAX_SEGMENT_WORDS ||
      durationMs >= MAX_SEGMENT_DURATION_MS

    if (shouldFlush) flush()
  }

  flush()
  return segments
}

function segmentFromWords(
  words: BufferedWord[],
  block: RecallTranscriptParticipantBlock
): Omit<FlatSegment, "index"> {
  const participantExternalId =
    block.participant.id != null ? String(block.participant.id) : null

  return {
    participantExternalId,
    participantName: block.participant.name?.trim() || null,
    participantEmail: block.participant.email ?? null,
    participantIsHost: block.participant.is_host ?? null,
    participantPlatform: block.participant.platform ?? null,
    participantExtraData: block.participant.extra_data ?? null,
    languageCode: block.language_code ?? null,
    text: words
      .map((w) => w.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
    startMs: Math.max(0, Math.round(words[0]!.startMs)),
    endMs: Math.max(0, Math.round(words[words.length - 1]!.endMs)),
    words: words.map((w, position) => ({
      text: w.text,
      startMs: Math.max(0, Math.round(w.startMs)),
      endMs: Math.max(0, Math.round(w.endMs)),
      position,
    })),
  }
}

/**
 * Recall delivers transcripts as one block per participant, each containing
 * a flat list of words with relative-second timestamps. We:
 *
 *   1. sort words chronologically within each participant,
 *   2. group consecutive words into utterances on >1.5s gaps, and
 *   3. split each utterance into phrase-sized segments (punctuation / caps).
 *
 * The result is sorted globally by start time for downstream consumers.
 */
export function flattenRecallTranscript(
  blocks: RecallTranscriptParticipantBlock[]
): FlatSegment[] {
  const tentative: Array<Omit<FlatSegment, "index">> = []

  for (const block of blocks) {
    const sortedWords = [...block.words].sort(
      (a, b) =>
        (a.start_timestamp.relative ?? 0) - (b.start_timestamp.relative ?? 0)
    )

    let buffer: BufferedWord[] = []
    let bufferEndMs: number | null = null

    const flushBuffer = () => {
      if (buffer.length === 0) return
      for (const chunk of splitWordBufferIntoSegments(buffer)) {
        tentative.push(segmentFromWords(chunk, block))
      }
      buffer = []
      bufferEndMs = null
    }

    for (const word of sortedWords) {
      const { startMs, endMs } = wordTimestampsMs(word)

      if (
        buffer.length > 0 &&
        bufferEndMs != null &&
        startMs - bufferEndMs > UTTERANCE_GAP_MS
      ) {
        flushBuffer()
      }

      buffer.push({ text: word.text, startMs, endMs })
      bufferEndMs = endMs
    }

    flushBuffer()
  }

  tentative.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs)

  return tentative.map((segment, index) => ({ index, ...segment }))
}
