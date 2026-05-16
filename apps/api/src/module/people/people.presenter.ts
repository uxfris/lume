import { UserSummary } from "@workspace/types"
import { initialsFromName } from "../meetings/meetings.presenter"

export function toUserSummary(user: {
  id: string
  name: string
  image: string | null
}): UserSummary {
  return {
    id: user.id,
    name: user.name,
    initials: initialsFromName(user.name),
    ...(user.image ? { avatarUrl: user.image } : {}),
  }
}
