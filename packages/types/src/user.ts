import { z } from "zod"
import { CurrentUserSchema } from "./workspace"

const ALLOWED_AVATAR_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

const avatarContentTypeSchema = z
  .string()
  .refine(
    (value): value is (typeof ALLOWED_AVATAR_MIME)[number] =>
      ALLOWED_AVATAR_MIME.includes(
        value as (typeof ALLOWED_AVATAR_MIME)[number]
      ),
    { message: "Unsupported image type. Allowed: JPEG, PNG, WebP, GIF." }
  )

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

export const UpdateUserBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
})
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>

export const UpdateUserResponseSchema = CurrentUserSchema
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>

export const PresignAvatarBodySchema = z.object({
  contentType: avatarContentTypeSchema,
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_AVATAR_BYTES, { message: "Image must be 5 MB or smaller." }),
})
export type PresignAvatarBody = z.infer<typeof PresignAvatarBodySchema>

export const PresignAvatarResponseSchema = z.object({
  uploadUrl: z.url(),
  imageUrl: z.url(),
  expiresInSeconds: z.number().int().positive(),
})
export type PresignAvatarResponse = z.infer<typeof PresignAvatarResponseSchema>
