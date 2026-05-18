import type { SlackIntegrationConfig } from "@workspace/types"
import { SlackIntegrationConfigSchema } from "@workspace/types"

const SLACK_API = "https://slack.com/api"

export function defaultSlackConfig(): SlackIntegrationConfig {
  return SlackIntegrationConfigSchema.parse({})
}

export async function exchangeSlackCode(code: string, redirectUri: string) {
  const clientId = process.env.SLACK_CLIENT_ID
  const clientSecret = process.env.SLACK_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("SLACK_NOT_CONFIGURED")
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  })

  const res = await fetch(`${SLACK_API}/oauth.v2.access`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const data = (await res.json()) as {
    ok?: boolean
    error?: string
    access_token?: string
    team?: { id?: string; name?: string }
    authed_user?: { id?: string }
    incoming_webhook?: { channel_id?: string; channel?: string }
  }

  if (!data.ok || !data.access_token) {
    throw new Error(data.error ?? "SLACK_OAUTH_FAILED")
  }

  return {
    accessToken: data.access_token,
    externalAccountId: data.team?.id ?? null,
    externalAccountName: data.team?.name ?? null,
    defaultChannelId: data.incoming_webhook?.channel_id ?? null,
    defaultChannelName: data.incoming_webhook?.channel ?? null,
  }
}

export async function listSlackChannels(accessToken: string) {
  console.log(accessToken.slice(0, 5))
  const channels: Array<{ id: string; name: string }> = []

  for (const type of ["public_channel", "private_channel"] as const) {
    let cursor: string | undefined
    do {
      const params = new URLSearchParams({
        types: type,
        exclude_archived: "true",
        limit: "200",
      })
      if (cursor) params.set("cursor", cursor)

      const res = await fetch(`${SLACK_API}/conversations.list?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = (await res.json()) as {
        ok?: boolean
        channels?: Array<{ id: string; name: string; is_member?: boolean }>
        response_metadata?: { next_cursor?: string }
        error?: string
      }

      console.log(data)

      if (!data.ok) {
        throw new Error(data.error ?? "SLACK_CHANNELS_FAILED")
      }

      for (const ch of data.channels ?? []) {
        if (ch.is_member !== false) {
          channels.push({ id: ch.id, name: ch.name })
        }
      }
      cursor = data.response_metadata?.next_cursor || undefined
    } while (cursor)
  }

  return channels.sort((a, b) => a.name.localeCompare(b.name))
}

export async function verifySlackChannelAccess(
  accessToken: string,
  channelId: string
): Promise<boolean> {
  const res = await fetch(
    `${SLACK_API}/conversations.info?channel=${channelId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  const data = (await res.json()) as { ok?: boolean }
  return Boolean(data.ok)
}
