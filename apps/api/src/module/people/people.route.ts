import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { membersResponseSchema } from "./people.schema"
import * as peopleService from "./people.service"

export const peopleRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/members",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["People"],
        summary: "Workspace members",
        response: {
          200: membersResponseSchema,
        },
      },
    },
    async (request) => {
      return peopleService.listMembers(request.workspace!.id)
    }
  )
}
