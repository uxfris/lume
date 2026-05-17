import { RequestOptions, client } from "./client"

const accountApi = {
  async updateAccount(body: {}, options?: RequestOptions): Promise<void> {
    await client.patch("/users", body, options)
  },
}
