import { z } from "zod"

export const UserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  avatarUrl: z.url().optional(),
})
export type UserSummary = z.infer<typeof UserSummarySchema>

export const ActionItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Task title is required"),
  isCompleted: z.boolean(),
  assignee: UserSummarySchema.nullable(),
})
export type ActionItem = z.infer<typeof ActionItemSchema>

export const TasksGroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  timestamp: z.string(), // ISO 8601
  tasks: z.array(ActionItemSchema),
})
export type TasksGroup = z.infer<typeof TasksGroupSchema>

export const TaskUrgentContextSchema = z.object({
  label: z.string(),
  mentionCount: z.number().int().positive().optional(),
})
export type TaskUrgentContext = z.infer<typeof TaskUrgentContextSchema>

export const TaskAIInsightSchema = z.object({
  meetingTitle: z.string(),
  meetingUpdatedAt: z.string(),
  recommendedTaskTitle: z.string(),
  confidence: z.number().int().min(0).max(100),
  alternateTaskTitle: z.string().optional(),
  urgentContexts: z.array(TaskUrgentContextSchema),
})
export type TaskAIInsight = z.infer<typeof TaskAIInsightSchema>

export const TaskAIInsightResponseSchema = z.object({
  insight: TaskAIInsightSchema.nullable(),
})
export type TaskAIInsightResponse = z.infer<typeof TaskAIInsightResponseSchema>

export const TaskProductivityStatsSchema = z.object({
  resolved: z.number().int().min(0),
  created: z.number().int().min(0),
  pacePercent: z.number().int().optional(),
})
export type TaskProductivityStats = z.infer<typeof TaskProductivityStatsSchema>

export const TaskProductivityResponseSchema = z.object({
  stats: TaskProductivityStatsSchema.nullable(),
})
export type TaskProductivityResponse = z.infer<
  typeof TaskProductivityResponseSchema
>

export const SyncTasksToLinearBodySchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1),
  teamId: z.string().min(1).optional(),
  meetingTitle: z.string().min(1).optional(),
})
export type SyncTasksToLinearBody = z.infer<typeof SyncTasksToLinearBodySchema>

export const SyncTasksToLinearResponseSchema = z.object({
  created: z.number().int().min(0),
})
export type SyncTasksToLinearResponse = z.infer<
  typeof SyncTasksToLinearResponseSchema
>

export type TaskSyncSelectionMode = "all" | "mine" | "select"
