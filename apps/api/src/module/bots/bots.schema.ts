import { z } from "zod"
import {
  StartBotMeetingBodySchema,
  StartBotMeetingResponseSchema,
} from "@workspace/types"

export const startBotMeetingBodySchema = StartBotMeetingBodySchema
export const startBotMeetingResponseSchema = StartBotMeetingResponseSchema

export const botErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})
