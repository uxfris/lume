import type { FastifyPluginAsync } from "fastify"
import { verifyRecallSignature } from "../../lib/recall"
import {
  extractBotId,
  extractEventType,
  processRecallEvent,
  recordFailedRecallWebhook,
} from "./recall.service"
import { processRealtimeEvent } from "./recall-realtime.service"

/**
 * Webhook routes are registered as a child plugin so we can override the
 * JSON content-type parser (capturing the raw body for HMAC verification)
 * without affecting the rest of the API. We deliberately skip Zod body
 * validation here — Recall ships multiple event shapes, and rejecting one
 * means we'd lose the signal.
 */
export const webhooksRoutes: FastifyPluginAsync = async (app) => {
  // Status changes + transcript artifact lifecycle (Svix-style webhooks).
  app.post(
    "/recall",
    {
      config: {
        rawBody: true,
      },
    },

    async (request, reply) => {
      const rawBody = request.rawBody

      if (!rawBody) {
        return reply
          .status(400)
          .send({ error: "MISSING_RAW_BODY", message: "Empty request body." })
      }

      const verification = verifyRecallSignature({
        rawBody,
        headers: request.headers,
      })
      if (!verification.ok) {
        request.log.warn(
          { reason: verification.reason },
          "rejected recall webhook"
        )
        return reply
          .status(401)
          .send({ error: "INVALID_SIGNATURE", message: verification.reason })
      }

      const payload = request.body
      try {
        const result = await processRecallEvent({
          payload,
          traceId: request.id,
        })
        if (result.ok) {
          return reply.status(200).send({
            ok: true,
            meetingId: result.meetingId,
            action: result.action,
          })
        }
        return reply.status(202).send({ ok: true, reason: result.reason })
      } catch (err) {
        request.log.error({ err }, "recall webhook processing failed")
        await recordFailedRecallWebhook({
          payload,
          error: (err as Error).message,
          externalBotId: extractBotId(payload),
          eventType: extractEventType(payload),
        }).catch(() => {})

        return reply.status(500).send({ error: "WEBHOOK_PROCESSING_FAILED" })
      }
    }
  )

  /**
   * Real-time endpoint receiver. Recall posts `transcript.data` events here
   * during the call when the bot is configured with `realtime_endpoints`.
   * Set `RECALL_REALTIME_WEBHOOK_URL` to point at this route to enable.
   */
  app.post("/recall/realtime", async (request, reply) => {
    const rawBody = (request as unknown as { rawBody?: Buffer }).rawBody
    if (!rawBody) {
      return reply.status(400).send({ error: "MISSING_RAW_BODY" })
    }

    const verification = verifyRecallSignature({
      rawBody,
      headers: request.headers,
    })
    if (!verification.ok) {
      request.log.warn(
        { reason: verification.reason },
        "rejected recall realtime webhook"
      )
      return reply
        .status(401)
        .send({ error: "INVALID_SIGNATURE", message: verification.reason })
    }

    try {
      const result = await processRealtimeEvent({
        payload: request.body,
        traceId: request.id,
      })
      return reply.status(200).send({ ok: true, ...result })
    } catch (err) {
      // Real-time webhook flow: 5xx on error so Recall retries up to its
      // built-in cap, but never block the request — return quickly.
      request.log.error({ err }, "recall realtime webhook failed")
      return reply.status(500).send({ error: "REALTIME_PROCESSING_FAILED" })
    }
  })
}
