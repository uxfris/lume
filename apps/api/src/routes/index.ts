import { FastifyInstance } from "fastify"
import { healthRoute } from "./health.route"
import { metricsRoute } from "./metrics.route"
import { userRoute } from "../module/users/users.route"
import { uploadsRoutes } from "../module/uploads/uploads.route"
import {
  invitationsAcceptRoute,
  workspacesRoutes,
} from "../module/workspaces/workspaces.route"
import { meetingsRoutes } from "../module/meetings/meetings.route"
import { tasksRoutes } from "../module/tasks/tasks.route"
import { searchRoutes } from "../module/search/search.route"
import { botsRoutes } from "../module/bots/bots.route"
import { webhooksRoutes } from "../module/webhooks/webhooks.route"
import { calendarRoutes } from "../module/calendar/calendar.route"
import { billingRoutes } from "../module/billing/billing.route"
import { channelRoutes } from "../module/channels/channel.route"
import { peopleRoutes } from "../module/people/people.route"
import { notificationsRoutes } from "../module/notifications/notifications.route"
import { integrationsRoutes } from "../module/integrations/integrations.route"

export async function registerRoute(app: FastifyInstance) {
  await app.register(healthRoute)
  await app.register(metricsRoute)
  await app.register(userRoute, { prefix: "/users" })
  await app.register(workspacesRoutes, { prefix: "/workspaces" })
  await app.register(invitationsAcceptRoute, { prefix: "/invitations" })
  await app.register(uploadsRoutes, { prefix: "/uploads" })
  await app.register(meetingsRoutes, { prefix: "/meetings" })
  await app.register(botsRoutes, { prefix: "/meetings" })
  await app.register(channelRoutes, { prefix: "/channels" })
  await app.register(tasksRoutes, { prefix: "/tasks" })
  await app.register(searchRoutes, { prefix: "/search" })
  await app.register(webhooksRoutes, { prefix: "/webhooks" })
  await app.register(calendarRoutes, { prefix: "/calendar" })
  await app.register(billingRoutes, { prefix: "/billing" })
  await app.register(peopleRoutes, { prefix: "/people" })
  await app.register(notificationsRoutes, { prefix: "/notifications" })
  await app.register(integrationsRoutes, { prefix: "/integrations" })
}
