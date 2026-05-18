import type { Job } from "bullmq"
import { Prisma, prisma } from "@workspace/database"
import { QueueName, type DeliverIntegrationsJobPayload } from "@workspace/queue"
import { SlackIntegrationConfigSchema, LinearIntegrationConfigSchema } from "@workspace/types"
import { logger } from "../logger"
import { postSlackMeetingSummary } from "../lib/integrations/slack-deliver"
import { createLinearIssuesFromTasks } from "../lib/integrations/linear-deliver"

function parseSummary(raw: Prisma.JsonValue | null) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>
  return {
    summary: typeof obj.summary === "string" ? obj.summary : undefined,
    keyPoints: Array.isArray(obj.keyPoints)
      ? obj.keyPoints.filter((p): p is string => typeof p === "string")
      : [],
    actionItems: Array.isArray(obj.actionItems)
      ? obj.actionItems
          .filter((a): a is Record<string, unknown> => typeof a === "object" && a !== null)
          .map((a) => ({
            title: typeof a.title === "string" ? a.title : "",
            assigneeHint:
              typeof a.assigneeHint === "string" ? a.assigneeHint : null,
          }))
          .filter((a) => a.title.length > 0)
      : [],
  }
}

export async function deliverIntegrationsHandler(
  job: Job<DeliverIntegrationsJobPayload>
): Promise<{ meetingId: string }> {
  const { meetingId, workspaceId, traceId } = job.data
  const log = logger.child({
    queue: QueueName.DeliverIntegrations,
    jobId: job.id,
    meetingId,
    workspaceId,
    traceId,
  })

  log.info("deliver integrations job received")

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, workspaceId, deletedAt: null },
    include: {
      tasks: { where: { isCompleted: false }, select: { id: true, title: true } },
    },
  })

  if (!meeting || meeting.status !== "SUMMARIZED") {
    log.warn("meeting missing or not summarized; skipping")
    return { meetingId }
  }

  const summary = parseSummary(meeting.summary)
  const frontendBase =
    process.env.FRONTEND_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  const meetingUrl = `${frontendBase}/meeting/${meeting.id}`

  const connections = await prisma.workspaceIntegration.findMany({
    where: { workspaceId, connectedAt: { not: null }, accessToken: { not: null } },
  })

  for (const conn of connections) {
    if (conn.provider === "SLACK") {
      const config = SlackIntegrationConfigSchema.parse(conn.config ?? {})
      if (!config.autoPostSummaries || !config.defaultChannelId || !conn.accessToken) {
        continue
      }

      try {
        await postSlackMeetingSummary({
          accessToken: conn.accessToken,
          channelId: config.defaultChannelId,
          meetingTitle: meeting.title,
          meetingUrl,
          summary: summary ?? {},
          config,
        })

        const channelLabel = config.defaultChannelName ?? config.defaultChannelId
        await prisma.integrationActivity.create({
          data: {
            workspaceId,
            provider: "SLACK",
            meetingId,
            status: "SUCCEEDED",
            title: `Summary posted to ${channelLabel} — ${meeting.title}`,
          },
        })
      } catch (err) {
        log.error({ err }, "slack delivery failed")
        await prisma.integrationActivity.create({
          data: {
            workspaceId,
            provider: "SLACK",
            meetingId,
            status: "FAILED",
            title: `Post failed — ${meeting.title}`,
            description: (err as Error).message,
          },
        })
      }
    }

    if (conn.provider === "LINEAR") {
      const config = LinearIntegrationConfigSchema.parse(conn.config ?? {})
      if (!config.autoCreateIssues || !conn.accessToken) {
        continue
      }

      try {
        const { created } = await createLinearIssuesFromTasks({
          accessToken: conn.accessToken,
          meetingTitle: meeting.title,
          config,
          tasks: meeting.tasks,
        })

        if (created > 0) {
          await prisma.integrationActivity.create({
            data: {
              workspaceId,
              provider: "LINEAR",
              meetingId,
              status: "SUCCEEDED",
              title: `${created} issue${created === 1 ? "" : "s"} created — ${meeting.title}`,
            },
          })
        }
      } catch (err) {
        log.error({ err }, "linear delivery failed")
        await prisma.integrationActivity.create({
          data: {
            workspaceId,
            provider: "LINEAR",
            meetingId,
            status: "FAILED",
            title: `Issue creation failed — ${meeting.title}`,
            description: (err as Error).message,
          },
        })
      }
    }
  }

  log.info("deliver integrations job completed")
  return { meetingId }
}
