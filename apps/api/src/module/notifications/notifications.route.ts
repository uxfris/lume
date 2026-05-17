import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import {
  listNotificationsResponseSchema,
  notificationItemSchema,
  notificationPreferencesSchema,
  unreadCountResponseSchema,
  updateNotificationPreferencesBodySchema,
} from "./notifications.schema"
import * as notificationsService from "./notifications.service"

const notificationIdParamsSchema = z.object({
  id: z.string().min(1),
})

const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(30),
})

const notFoundSchema = z.object({ error: z.string() })

export const notificationsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/preferences",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Notifications"],
        summary: "Get notification preferences for the current user",
        response: { 200: notificationPreferencesSchema },
      },
    },
    async (request) => {
      return notificationsService.getPreferences(request.user!.id)
    }
  )

  app.patch(
    "/preferences",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Notifications"],
        summary: "Update notification preferences for the current user",
        body: updateNotificationPreferencesBodySchema,
        response: { 200: notificationPreferencesSchema },
      },
    },
    async (request) => {
      return notificationsService.updatePreferences(
        request.user!.id,
        request.body
      )
    }
  )

  app.get(
    "/",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Notifications"],
        summary: "List in-app notifications for the current user",
        querystring: listNotificationsQuerySchema,
        response: { 200: listNotificationsResponseSchema },
      },
    },
    async (request) => {
      return notificationsService.listNotifications(
        request.user!.id,
        request.query.limit
      )
    }
  )

  app.get(
    "/unread-count",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Notifications"],
        summary: "Unread notification count for the current user",
        response: { 200: unreadCountResponseSchema },
      },
    },
    async (request) => {
      return notificationsService.getUnreadCount(request.user!.id)
    }
  )

  app.post(
    "/:id/read",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Notifications"],
        summary: "Mark a notification as read",
        params: notificationIdParamsSchema,
        response: {
          200: notificationItemSchema,
          404: notFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const item = await notificationsService.markNotificationRead(
        request.user!.id,
        request.params.id
      )
      if (!item) {
        return reply.status(404).send({ error: "NOT_FOUND" })
      }
      return item
    }
  )

  app.post(
    "/read-all",
    {
      preHandler: [app.verifySession],
      schema: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      await notificationsService.markAllNotificationsRead(request.user!.id)
      return reply.status(204).send(null)
    }
  )
}
