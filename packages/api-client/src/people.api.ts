import { UserSummary } from "@workspace/types"
import { RequestOptions, client } from "./client"

export const peopleApi = {
  async fetchMembers(options?: RequestOptions): Promise<UserSummary[]> {
    return client.get("/people/members", options)
  },
}
