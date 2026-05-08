import fp from "fastify-plugin"
import type { FastifyReply, FastifyRequest } from "fastify"
import { prisma, utcBillingPeriod } from "@workspace/database"
import { starterPlanLimits } from "@workspace/types"
import { buildQuotaExceededBody } from "../module/billing/quota-response"

export default fp(async (app) => {
  app.decorate(
    "requireQuota",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const ws = request.workspace
      if (!ws) {
        return reply.status(500).send({
          error: "WORKSPACE_CONTEXT_MISSING",
          message: "requireQuota must run after requireWorkspace.",
        })
      }

      if (ws.plan !== "STARTER") {
        return
      }

      const row = await prisma.usageCounter.findUnique({
        where: {
          workspaceId_period: {
            workspaceId: ws.id,
            period: utcBillingPeriod(),
          },
        },
      })

      const usedMinutes = row?.minutesTranscribed ?? 0
      const usedMeetings = row?.meetingsTranscribed ?? 0

      if (usedMinutes >= starterPlanLimits.minutesPerMonth) {
        return reply
          .status(402)
          .send(
            buildQuotaExceededBody({
              usedMinutes,
              usedMeetings,
              reason: "minutes",
            })
          )
      }

      if (usedMeetings >= starterPlanLimits.meetingsPerMonth) {
        return reply
          .status(402)
          .send(
            buildQuotaExceededBody({
              usedMinutes,
              usedMeetings,
              reason: "meetings",
            })
          )
      }
    }
  )
})
