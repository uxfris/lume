import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"

export const channelRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "",
      },
    },
    async (request, reply) => {}
  )

  app.patch(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "",
      },
    },
    async (request, reply) => {}
  )
  app.delete(
    "/:id",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "",
      },
    },
    async (request, reply) => {}
  )

  app.get(
    "/:id/meetings",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "",
      },
    },
    async (request, reply) => {}
  )
  app.post(
    "/:id/meetings",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "",
      },
    },
    async (request, reply) => {}
  )

  app.delete(
    "/:id/meetings",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Channel"],
        summary: "",
      },
    },
    async (request, reply) => {}
  )
}
