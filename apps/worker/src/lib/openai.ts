import OpenAI from "openai"
import pLimitImport from "p-limit"

/** Works with both tsx (ESM) and the CJS bundle's `__toESM` interop. */
const pLimit =
  typeof pLimitImport === "function"
    ? pLimitImport
    : (pLimitImport as { default: typeof pLimitImport }).default
import {
  MeetingAnalysisContentSchema,
  type MeetingAnalysisContent,
} from "@workspace/types"
import { env } from "../config/env"

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

/** Rough GPT token estimate for English prose (avoid tiktoken dependency). */
const CHARS_PER_TOKEN = 4
const CHUNK_TOKENS = 500
const OVERLAP_TOKENS = 50
/** Stay under gpt-4o-mini context with room for instructions + schema overhead. */
const MAX_SINGLE_PASS_CHARS = 90_000

const llmLimit = pLimit(5)
const embedLimit = pLimit(5)

const GPT4O_MINI_INPUT_PER_M = 0.15
const GPT4O_MINI_OUTPUT_PER_M = 0.6
const EMBEDDING_SMALL_PER_M = 0.02

/** @deprecated Use `MeetingAnalysisContent` from `@workspace/types`. */
export type MeetingAnalysis = MeetingAnalysisContent

export { MeetingAnalysisContentSchema as MeetingAnalysisSchema }

const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    overview: { type: "string" },
    keyTakeaways: {
      type: "array",
      items: { type: "string" },
    },
    topicsDiscussed: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
        },
        required: ["title", "summary"],
        additionalProperties: false,
      },
    },
    decisions: {
      type: "array",
      items: { type: "string" },
    },
    openQuestions: {
      type: "array",
      items: { type: "string" },
    },
    actionItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          assigneeHint: { type: ["string", "null"] },
        },
        required: ["title", "assigneeHint"],
        additionalProperties: false,
      },
    },
    sentiment: {
      type: "string",
      enum: ["positive", "neutral", "negative", "mixed"],
    },
  },
  required: [
    "overview",
    "keyTakeaways",
    "topicsDiscussed",
    "decisions",
    "openQuestions",
    "actionItems",
    "sentiment",
  ],
  additionalProperties: false,
} as const

const CHUNK_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    facts: {
      type: "array",
      items: { type: "string" },
    },
    decisions: {
      type: "array",
      items: { type: "string" },
    },
    actionItems: {
      type: "array",
      items: { type: "string" },
    },
    openQuestions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["facts", "decisions", "actionItems", "openQuestions"],
  additionalProperties: false,
} as const

const ANALYSIS_SYSTEM_PROMPT = `You are an expert meeting analyst preparing notes for a Notion-style document editor.

Your output will be converted into structured blocks: overview paragraph, key takeaway bullets, topic subsections, decisions, open questions, and action-item checkboxes.

Quality bar:
- Be comprehensive: capture substantive discussion, not only the conclusion.
- Overview: 3–6 sentences covering purpose, main arc, and outcome.
- Key takeaways: 5–10 distinct, specific bullets a reader could act on without watching the meeting.
- Topics discussed: 2–6 major themes; each needs a short title and 2–4 sentence summary with names, numbers, and constraints when mentioned.
- Decisions: explicit agreements, approvals, or direction changes (empty array if none).
- Open questions: unresolved items, blockers, or follow-ups (empty array if none).
- Action items: concrete tasks with clear owners when inferable; use assigneeHint for a person/role name or null if unknown.
- Sentiment: overall tone of the meeting (positive, neutral, negative, or mixed).

Write in clear, professional prose. Do not invent facts not supported by the transcript.`

const CHUNK_SYSTEM_PROMPT = `You extract structured facts from a meeting transcript excerpt (one part of a longer recording).

Return:
- facts: substantive points, arguments, metrics, and context (short bullets)
- decisions: explicit decisions in this excerpt
- actionItems: tasks or commitments stated in this excerpt
- openQuestions: unresolved questions or blockers in this excerpt

Use empty arrays when a category has nothing in this excerpt. Do not repeat filler or greetings.`

function gpt4oMiniCostUsd(usage: {
  prompt_tokens?: number
  completion_tokens?: number
}): number {
  const inp = usage.prompt_tokens ?? 0
  const out = usage.completion_tokens ?? 0
  return (inp * GPT4O_MINI_INPUT_PER_M + out * GPT4O_MINI_OUTPUT_PER_M) / 1_000_000
}

function embeddingCostUsd(totalTokens: number): number {
  return (totalTokens * EMBEDDING_SMALL_PER_M) / 1_000_000
}

export function chunkTranscriptForLlm(fullText: string): string[] {
  const windowChars = CHUNK_TOKENS * CHARS_PER_TOKEN
  const stepChars = (CHUNK_TOKENS - OVERLAP_TOKENS) * CHARS_PER_TOKEN
  if (fullText.length <= windowChars) return [fullText]

  const out: string[] = []
  for (let i = 0; i < fullText.length; i += stepChars) {
    out.push(fullText.slice(i, i + windowChars))
    if (i + windowChars >= fullText.length) break
  }
  return out
}

async function structuredCompletion(params: {
  name: string
  schema: Record<string, unknown>
  system: string
  user: string
}): Promise<{ raw: string; costUsd: number }> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: params.name,
        strict: true,
        schema: params.schema,
      },
    },
  })

  const choice = completion.choices[0]?.message?.content
  if (!choice) throw new Error("OpenAI returned empty completion")

  const costUsd = gpt4oMiniCostUsd(completion.usage ?? {})
  return { raw: choice, costUsd }
}

type ChunkExtraction = {
  facts: string[]
  decisions: string[]
  actionItems: string[]
  openQuestions: string[]
}

async function extractFromChunk(
  chunk: string,
  index: number,
  total: number
): Promise<{ extraction: ChunkExtraction; costUsd: number }> {
  return llmLimit(async () => {
    const { raw, costUsd } = await structuredCompletion({
      name: "chunk_extraction",
      schema: CHUNK_EXTRACTION_SCHEMA,
      system: CHUNK_SYSTEM_PROMPT,
      user: `Excerpt ${index + 1} of ${total}:\n\n${chunk}`,
    })
    const parsed = JSON.parse(raw) as Partial<ChunkExtraction>
    return {
      extraction: {
        facts: Array.isArray(parsed.facts) ? parsed.facts : [],
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        openQuestions: Array.isArray(parsed.openQuestions)
          ? parsed.openQuestions
          : [],
      },
      costUsd,
    }
  })
}

function formatChunkExtractionsForReduce(
  extractions: ChunkExtraction[]
): string {
  const facts = extractions.flatMap((e) => e.facts)
  const decisions = extractions.flatMap((e) => e.decisions)
  const actionItems = extractions.flatMap((e) => e.actionItems)
  const openQuestions = extractions.flatMap((e) => e.openQuestions)

  const section = (title: string, bullets: string[]) =>
    bullets.length > 0
      ? `${title}:\n${bullets.map((b) => `- ${b}`).join("\n")}`
      : ""

  return [
    section("Facts and discussion points", facts),
    section("Decisions", decisions),
    section("Action items (raw)", actionItems),
    section("Open questions", openQuestions),
  ]
    .filter(Boolean)
    .join("\n\n")
}

async function analyzeCondensedTranscript(
  condensedText: string
): Promise<{ analysis: MeetingAnalysisContent; costUsd: number }> {
  return llmLimit(async () => {
    const { raw, costUsd } = await structuredCompletion({
      name: "meeting_analysis",
      schema: ANALYSIS_JSON_SCHEMA,
      system: ANALYSIS_SYSTEM_PROMPT,
      user: `Produce a complete meeting analysis from the following material. Deduplicate overlapping points across sections.\n\n${condensedText}`,
    })

    const parsed = JSON.parse(raw) as unknown
    const analysis = MeetingAnalysisContentSchema.parse(parsed)

    return { analysis, costUsd }
  })
}

/**
 * Single-call analysis when the transcript fits comfortably in context;
 * otherwise map (chunk extraction) + reduce (structured analysis).
 */
export async function analyzeMeetingTranscript(
  fullTranscript: string
): Promise<{ analysis: MeetingAnalysisContent; costUsd: number }> {
  const trimmed = fullTranscript.trim()
  if (!trimmed) {
    throw new Error("Empty transcript; nothing to analyze")
  }

  if (trimmed.length <= MAX_SINGLE_PASS_CHARS) {
    const chunks = chunkTranscriptForLlm(trimmed)
    const body =
      chunks.length === 1
        ? trimmed
        : chunks
            .map((c, i) => `--- Segment ${i + 1} / ${chunks.length} ---\n${c}`)
            .join("\n\n")

    return analyzeCondensedTranscript(
      `Full meeting transcript:\n\n${body}`
    )
  }

  const chunks = chunkTranscriptForLlm(trimmed)
  const chunkResults = await Promise.all(
    chunks.map((chunk, index) => extractFromChunk(chunk, index, chunks.length))
  )
  const mapCost = chunkResults.reduce((sum, r) => sum + r.costUsd, 0)
  const extractions = chunkResults.map((r) => r.extraction)

  const condensed = formatChunkExtractionsForReduce(extractions)

  const { analysis, costUsd: reduceCost } = await analyzeCondensedTranscript(
    `Material extracted from a long meeting (synthesize into one coherent analysis):\n\n${condensed}`
  )

  return { analysis, costUsd: mapCost + reduceCost }
}

export async function embedText(text: string): Promise<{
  embedding: number[]
  costUsd: number
}> {
  return embedLimit(async () => {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })

    const vec = res.data[0]?.embedding
    if (!vec || vec.length !== 1536) {
      throw new Error("Unexpected embedding dimensions from OpenAI")
    }

    const tokens = res.usage?.total_tokens ?? Math.ceil(text.length / CHARS_PER_TOKEN)
    const costUsd = embeddingCostUsd(tokens)

    return { embedding: vec, costUsd }
  })
}

export async function summarize(transcript: string): Promise<string> {
  const { analysis } = await analyzeMeetingTranscript(transcript)
  return analysis.overview
}

export async function extractActionItems(
  transcript: string
): Promise<MeetingAnalysisContent["actionItems"]> {
  const { analysis } = await analyzeMeetingTranscript(transcript)
  return analysis.actionItems
}

export async function embed(chunk: string) {
  return embedText(chunk)
}
