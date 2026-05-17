import {
  CurrentUserSchema,
  PresignAvatarBody,
  PresignAvatarResponseSchema,
  type CurrentUser,
  type PresignAvatarResponse,
} from "@workspace/types"
import { client, RequestOptions } from "./client"

export const accountApi = {
  async updateProfile(
    body: { name: string },
    options?: RequestOptions
  ): Promise<CurrentUser> {
    const data = await client.patch<unknown>("/users", body, options)
    return CurrentUserSchema.parse(data)
  },

  async presignAvatar(
    body: PresignAvatarBody,
    options?: RequestOptions
  ): Promise<PresignAvatarResponse> {
    const data = await client.post<unknown>("/users/avatar/presign", body, options)
    return PresignAvatarResponseSchema.parse(data)
  },

  async completeAvatar(options?: RequestOptions): Promise<CurrentUser> {
    const data = await client.post<unknown>("/users/avatar/complete", {}, options)
    return CurrentUserSchema.parse(data)
  },
}
