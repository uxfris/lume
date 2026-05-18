import z from "zod"

export {
  GetMeResponseSchema as getMeResponseSchema,
  UpdateUserBodySchema as updateUserBodySchema,
  UpdateUserResponseSchema as updateUserResponseSchema,
  PresignAvatarBodySchema as presignAvatarBodySchema,
  PresignAvatarResponseSchema as presignAvatarResponseSchema,
  AccountDeletionContextSchema as accountDeletionContextSchema,
  CancelAccountDeletionBodySchema as cancelAccountDeletionBodySchema,
  DeleteAccountBodySchema as deleteAccountBodySchema,
  ScheduleAccountDeletionResponseSchema as scheduleAccountDeletionResponseSchema,
} from "@workspace/types"

export const avatarErrorSchema = z.object({
  error: z.string(),
})

export const deleteAccountErrorSchema = z.object({
  error: z.string(),
  workspaceName: z.string().optional(),
  scheduledDeletionAt: z.string().optional(),
})

export const userIdParamsSchema = z.object({
  userId: z.string().min(1),
})
