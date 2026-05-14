import { toUserSummary } from "./people.presenter"
import { peopleRepo } from "./people.repo"

export async function listMembers(workspaceId: string) {
  const members = peopleRepo.listMembersWithUsers(workspaceId)
  return (await members).map((m) => toUserSummary(m.user))
}
