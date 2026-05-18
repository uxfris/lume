import { z } from "zod"
import {
  ActionItemSchema,
  SyncTasksToLinearBodySchema,
  SyncTasksToLinearResponseSchema,
  TaskAIInsightResponseSchema,
  TaskProductivityResponseSchema,
  TasksGroupSchema,
  UserSummarySchema,
} from "@workspace/types"

export const taskIdParamsSchema = z.object({
  id: z.string().min(1),
})

export const createTaskBodySchema = z.object({
  title: z.string().min(1).max(500),
  isCompleted: z.boolean().optional().default(false),
  meetingId: z.string().min(1).nullable().optional(),
  assigneeId: z.string().min(1).nullable().optional(),
})

export const patchTaskBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
})

export const toggleTaskBodySchema = z.object({
  isCompleted: z.boolean(),
})

export const meetingIdParamsSchema = z.object({
  meetingId: z.string().min(1),
})

export const listMeetingTasksResponseSchema = z.array(ActionItemSchema)

export const listTasksQuerySchema = z.object({
  filter: z
    .enum(["all", "assigned_to_me", "from_last_meeting", "completed"])
    .optional()
    .default("all"),
})

export const listTasksResponseSchema = z.array(TasksGroupSchema)

export const assigneesResponseSchema = z.array(UserSummarySchema)

export const taskErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})

export const createTaskResponseSchema = ActionItemSchema

export const taskAIInsightResponseSchema = TaskAIInsightResponseSchema

export const taskProductivityResponseSchema = TaskProductivityResponseSchema

export const syncTasksToLinearBodySchema = SyncTasksToLinearBodySchema

export const syncTasksToLinearResponseSchema = SyncTasksToLinearResponseSchema
