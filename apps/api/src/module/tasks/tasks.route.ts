import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import * as tasksService from "./tasks.service"
import {
  assigneesResponseSchema,
  createTaskBodySchema,
  createTaskResponseSchema,
  listMeetingTasksResponseSchema,
  listTasksQuerySchema,
  listTasksResponseSchema,
  meetingIdParamsSchema,
  patchTaskBodySchema,
  taskAIInsightResponseSchema,
  taskProductivityResponseSchema,
  syncTasksToLinearBodySchema,
  syncTasksToLinearResponseSchema,
  taskErrorSchema,
  taskIdParamsSchema,
  toggleTaskBodySchema,
} from "./tasks.schema"

export const tasksRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/assignees",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Workspace members usable as task assignees",
        response: {
          200: assigneesResponseSchema,
        },
      },
    },
    async (request) => {
      return tasksService.listAssignees(request.workspace!.id)
    }
  )

  app.get(
    "/meeting/:meetingId",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Tasks for a single meeting",
        params: meetingIdParamsSchema,
        response: {
          200: listMeetingTasksResponseSchema,
          404: taskErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await tasksService.listMeetingTasks({
        workspaceId: request.workspace!.id,
        meetingId: request.params.meetingId,
      })

      if ("error" in result) {
        return reply.status(404).send({ error: result.error })
      }

      return result
    }
  )

  app.get(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Tasks grouped by meeting",
        querystring: listTasksQuerySchema,
        response: {
          200: listTasksResponseSchema,
        },
      },
    },
    async (request) => {
      return tasksService.listTaskGroups({
        workspaceId: request.workspace!.id,
        currentUserId: request.user!.id,
        filter: request.query.filter,
      })
    }
  )

  app.get(
    "/insights",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "AI prioritization insight from the latest analyzed meeting",
        response: {
          200: taskAIInsightResponseSchema,
        },
      },
    },
    async (request) => {
      return tasksService.getTaskAIInsight(request.workspace!.id)
    }
  )

  app.get(
    "/productivity",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Workspace task productivity totals and weekly pace",
        response: {
          200: taskProductivityResponseSchema,
        },
      },
    },
    async (request) => {
      return tasksService.getTaskProductivity(request.workspace!.id)
    }
  )

  app.post(
    "/sync/linear",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Create Linear issues from selected tasks",
        body: syncTasksToLinearBodySchema,
        response: {
          200: syncTasksToLinearResponseSchema,
          400: taskErrorSchema,
          404: taskErrorSchema,
          502: taskErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await tasksService.syncTasksToLinear({
        workspaceId: request.workspace!.id,
        taskIds: request.body.taskIds,
        teamId: request.body.teamId,
        meetingTitle: request.body.meetingTitle,
      })

      if (!result.ok) {
        if (result.error === "NOT_CONNECTED") {
          return reply.status(404).send({
            error: result.error,
            message: "Connect Linear in Integrations before syncing tasks.",
          })
        }
        if (result.error === "NO_TASKS") {
          return reply.status(400).send({
            error: result.error,
            message: "No valid tasks were found to sync.",
          })
        }
        return reply.status(502).send({
          error: result.error,
          message: result.message ?? "Failed to create Linear issues.",
        })
      }

      return { created: result.created }
    }
  )

  app.post(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Create a task",
        body: createTaskBodySchema,
        response: {
          201: createTaskResponseSchema,
          400: taskErrorSchema,
          404: taskErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const body = request.body
      const result = await tasksService.createTask({
        workspaceId: request.workspace!.id,
        title: body.title,
        isCompleted: body.isCompleted ?? false,
        meetingId: body.meetingId ?? undefined,
        assigneeId: body.assigneeId ?? undefined,
      })

      if ("error" in result) {
        const status = result.error === "MEETING_NOT_FOUND" ? 404 : 400
        return reply.status(status).send({
          error: result.error,
          message:
            result.error === "ASSIGNEE_INVALID"
              ? "Assignee is not a member of this workspace."
              : undefined,
        })
      }

      return reply.status(201).send(result)
    }
  )

  app.patch(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Update task title or assignee",
        params: taskIdParamsSchema,
        body: patchTaskBodySchema,
        response: {
          204: z.undefined(),
          400: taskErrorSchema,
          404: taskErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await tasksService.patchTask({
        workspaceId: request.workspace!.id,
        taskId: request.params.id,
        title: request.body.title,
        assigneeId: request.body.assigneeId,
      })

      if (!result.ok) {
        if (result.reason === "ASSIGNEE_INVALID") {
          return reply.status(400).send({
            error: "ASSIGNEE_INVALID",
            message: "Assignee is not a member of this workspace.",
          })
        }
        return reply.status(404).send({ error: "TASK_NOT_FOUND" })
      }

      return reply.status(204).send()
    }
  )

  app.post(
    "/:id/toggle",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Set task completion state",
        params: taskIdParamsSchema,
        body: toggleTaskBodySchema,
        response: {
          204: z.undefined(),
          404: taskErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await tasksService.toggleTask({
        workspaceId: request.workspace!.id,
        taskId: request.params.id,
        isCompleted: request.body.isCompleted,
      })

      if (!result.ok) {
        return reply.status(404).send({ error: "TASK_NOT_FOUND" })
      }

      return reply.status(204).send()
    }
  )

  app.delete(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Tasks"],
        summary: "Delete a task",
        params: taskIdParamsSchema,
        response: {
          204: z.undefined(),
          404: taskErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await tasksService.deleteTask({
        workspaceId: request.workspace!.id,
        taskId: request.params.id,
      })

      if (!result.ok) {
        return reply.status(404).send({ error: "TASK_NOT_FOUND" })
      }

      return reply.status(204).send()
    }
  )
}
