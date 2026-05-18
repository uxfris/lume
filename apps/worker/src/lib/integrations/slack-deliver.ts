import { SlackIntegrationConfigSchema } from "@workspace/types"

const SLACK_API = "https://slack.com/api"

type MeetingSummary = {
  summary?: string
  keyPoints?: string[]
  actionItems?: Array<{ title: string; assigneeHint?: string | null }>
}

export async function postSlackMeetingSummary(input: {
  accessToken: string
  channelId: string
  meetingTitle: string
  meetingUrl: string
  summary: MeetingSummary
  config: unknown
}) {
  const config = SlackIntegrationConfigSchema.parse(input.config)

  const lines: string[] = [
    `*${input.meetingTitle}*`,
    "",
    input.summary.summary ?? "_No summary available._",
  ]

  if (input.summary.keyPoints?.length) {
    lines.push("", "*Key points*")
    for (const point of input.summary.keyPoints) {
      lines.push(`• ${point}`)
    }
  }

  if (input.summary.actionItems?.length) {
    lines.push("", "*Action items*")
    for (const item of input.summary.actionItems) {
      const mention =
        config.tagActionItemOwners && item.assigneeHint
          ? ` (@${item.assigneeHint})`
          : ""
      lines.push(`• ${item.title}${mention}`)
    }
  }

  if (config.includeTranscriptLink) {
    lines.push("", `<${input.meetingUrl}|View meeting in Lume>`)
  }

  const res = await fetch(`${SLACK_API}/chat.postMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: input.channelId,
      text: lines.join("\n"),
      unfurl_links: false,
    }),
  })

  const data = (await res.json()) as { ok?: boolean; error?: string }
  if (!data.ok) {
    throw new Error(data.error ?? "SLACK_POST_FAILED")
  }
}
