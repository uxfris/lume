import { UserSummary } from "@workspace/types"
import { resolveUserImageUrl } from "../../lib/user-avatar"
import { initialsFromName } from "../meetings/meetings.presenter"

export function toUserSummary(user: {
  id: string
  name: string
  image: string | null
}): UserSummary {
  const avatarUrl = resolveUserImageUrl(user.id, user.image)
  return {
    id: user.id,
    name: user.name,
    initials: initialsFromName(user.name),
    ...(avatarUrl ? { avatarUrl } : {}),
  }
}
