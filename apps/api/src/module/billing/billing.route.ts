import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import * as billingService from "./billing.service"
import {
  billingCheckoutBodySchema,
  billingCheckoutResponseSchema,
  billingPortalResponseSchema,
  billingUsageResponseSchema,
} from "./billing.schema"

const checkoutUnavailableSchema = z.object({
  error: z.string(),
  message: z.string(),
})

const portalUnavailableSchema = z.object({
  error: z.string(),
  message: z.string(),
})

export const billingRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Billing"],
        summary: "Current workspace plan and usage for the UTC billing month",
        response: {
          200: billingUsageResponseSchema,
        },
      },
    },
    async (request) => {
      return billingService.getBillingForWorkspace(request.workspace!)
    }
  )

  app.post(
    "/checkout",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspace,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Billing"],
        summary: "Create a Stripe Checkout session for Studio Pro",
        body: billingCheckoutBodySchema,
        response: {
          200: billingCheckoutResponseSchema,
          503: checkoutUnavailableSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await billingService.createStudioProCheckoutSession({
        workspace: request.workspace!,
        userId: request.user!.id,
        userEmail: request.user!.email,
        billingPeriod: request.body.billingPeriod,
      })

      if (!result.ok) {
        return reply.status(503).send({
          error: "STRIPE_NOT_CONFIGURED",
          message:
            "Stripe billing is not configured on this server. Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID_STUDIO_PRO_MONTHLY, STRIPE_PRICE_ID_STUDIO_PRO_YEARLY, and FRONTEND_URL.",
        })
      }

      return reply.status(200).send({ url: result.url })
    }
  )

  app.post(
    "/portal",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspace,
        app.requireRole(["OWNER", "ADMIN"]),
      ],
      schema: {
        tags: ["Billing"],
        summary: "Create a Stripe Billing Portal session",
        response: {
          200: billingPortalResponseSchema,
          422: portalUnavailableSchema,
          503: portalUnavailableSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await billingService.createBillingPortalSession({
        workspace: request.workspace!,
      })

      if (!result.ok) {
        if (result.error === "STRIPE_CUSTOMER_NOT_FOUND") {
          return reply.status(422).send({
            error: "STRIPE_CUSTOMER_NOT_FOUND",
            message:
              "No Stripe customer is linked to this workspace yet. Complete checkout first, then retry.",
          })
        }

        return reply.status(503).send({
          error: "STRIPE_NOT_CONFIGURED",
          message:
            "Stripe billing portal is not configured on this server. Set STRIPE_SECRET_KEY and FRONTEND_URL.",
        })
      }

      return reply.status(200).send({ url: result.url })
    }
  )
}
