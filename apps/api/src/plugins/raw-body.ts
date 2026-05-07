import rawBody from "fastify-raw-body"
import fp from "fastify-plugin"

export default fp(async (app) => {
  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: false,
    runFirst: true,
  })
})
