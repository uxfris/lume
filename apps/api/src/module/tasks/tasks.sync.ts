import { LinearIntegrationConfigSchema } from "@workspace/types"
import { createLinearIssuesFromTasks } from "../integrations/integrations.linear"
import { integrationsRepo } from "../integrations/integrations.repo"
import { tasksRepo } from "./tasks.repo"

export type SyncTasksToLinearResult =
  | { ok: true; created: number }
  | {
      ok: false
      error: "NOT_CONNECTED" | "NO_TASKS" | "SYNC_FAILED"
      message?: string
    }

export async function syncTasksToLinear(input: {
  workspaceId: string
  taskIds: string[]
  teamId?: string
  meetingTitle?: string
}): Promise<SyncTasksToLinearResult> {
  const connection = await integrationsRepo.findOne(input.workspaceId, "LINEAR")
  if (!connection?.accessToken || !connection.connectedAt) {
    return { ok: false, error: "NOT_CONNECTED" }
  }

  const tasks = await tasksRepo.findManyByIds(input.workspaceId, input.taskIds)
  if (tasks.length === 0) {
    return { ok: false, error: "NO_TASKS" }
  }

  const baseConfig = LinearIntegrationConfigSchema.parse(connection.config ?? {})
  const config = input.teamId
    ? { ...baseConfig, defaultTeamId: input.teamId }
    : baseConfig
  const meetingTitle = input.meetingTitle ?? "Meeting"

  try {
    const { created } = await createLinearIssuesFromTasks({
      accessToken: connection.accessToken,
      meetingTitle,
      config,
      tasks: tasks.map((task) => ({ id: task.id, title: task.title })),
      manual: true,
    })

    if (created > 0) {
      await integrationsRepo.createActivity({
        workspaceId: input.workspaceId,
        provider: "LINEAR",
        meetingId: tasks.find((task) => task.meetingId)?.meetingId ?? null,
        status: "SUCCEEDED",
        title: `${created} issue${created === 1 ? "" : "s"} created — ${meetingTitle}`,
      })
    }

    return { ok: true, created }
  } catch (err) {
    await integrationsRepo.createActivity({
      workspaceId: input.workspaceId,
      provider: "LINEAR",
      meetingId: tasks.find((task) => task.meetingId)?.meetingId ?? null,
      status: "FAILED",
      title: `Issue creation failed — ${meetingTitle}`,
      description: (err as Error).message,
    })

    return {
      ok: false,
      error: "SYNC_FAILED",
      message: (err as Error).message,
    }
  }
}
