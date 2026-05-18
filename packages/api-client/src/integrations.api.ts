import type {
  Integration,
  IntegrationDetail,
  IntegrationRecentActivity,
  IntegrationChannel,
  LinearIntegrationConfig,
  SlackIntegrationConfig,
} from "@workspace/types"
import { client, type RequestOptions } from "./client"

export const integrationsApi = {
  list(options?: RequestOptions): Promise<{ integrations: Integration[] }> {
    return client.get("/integrations", options)
  },

  getDetail(
    provider: "slack" | "linear",
    options?: RequestOptions
  ): Promise<IntegrationDetail> {
    return client.get(`/integrations/${provider}`, options)
  },

  getActivity(
    provider: "slack" | "linear",
    options?: RequestOptions
  ): Promise<{ activities: IntegrationRecentActivity[] }> {
    return client.get(`/integrations/${provider}/activity`, options)
  },

  getOAuthUrl(
    provider: "slack" | "linear",
    options?: RequestOptions
  ): Promise<{ url: string }> {
    return client.get(`/integrations/${provider}/oauth-url`, options)
  },

  listChannels(
    provider: "slack" | "linear",
    options?: RequestOptions
  ): Promise<{ channels: IntegrationChannel[] }> {
    return client.get(`/integrations/${provider}/channels`, options)
  },

  disconnect(
    provider: "slack" | "linear",
    options?: RequestOptions
  ): Promise<void> {
    return client.delete(`/integrations/${provider}`, options)
  },

  patchSlackSettings(
    body: Partial<SlackIntegrationConfig>,
    options?: RequestOptions
  ): Promise<void> {
    return client.patch("/integrations/slack/settings", body, options)
  },

  patchLinearSettings(
    body: Partial<LinearIntegrationConfig>,
    options?: RequestOptions
  ): Promise<void> {
    return client.patch("/integrations/linear/settings", body, options)
  },

  setSlackChannel(
    body: { channelId: string; channelName: string },
    options?: RequestOptions
  ): Promise<void> {
    return client.patch("/integrations/slack/channel", body, options)
  },
}
