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
