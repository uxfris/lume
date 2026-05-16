import {
  InviteMeetingShareBodySchema,
  InviteMeetingShareResponseSchema,
  MeetingShareStateSchema,
  UpdateMeetingGeneralAccessBodySchema,
  UpdateMeetingShareBodySchema,
} from "@workspace/types"
import { z } from "zod"
import { meetingErrorSchema } from "./meetings.schema"

export const meetingShareParamsSchema = z.object({
  id: z.string().min(1),
})

export const meetingShareInviteParamsSchema = z.object({
  id: z.string().min(1),
  shareId: z.string().min(1),
})

export {
  InviteMeetingShareBodySchema as inviteMeetingShareBodySchema,
  InviteMeetingShareResponseSchema as inviteMeetingShareResponseSchema,
  MeetingShareStateSchema as meetingShareStateSchema,
  UpdateMeetingGeneralAccessBodySchema as updateMeetingGeneralAccessBodySchema,
  UpdateMeetingShareBodySchema as updateMeetingShareBodySchema,
  meetingErrorSchema,
}
