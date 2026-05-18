import { createHmac, timingSafeEqual } from "node:crypto"
import { env } from "../../config/env"
import type { IntegrationProviderId } from "@workspace/types"

const STATE_TTL_MS = 10 * 60 * 1000

type OAuthStatePayload = {
  workspaceId: string
  userId: string
  provider: IntegrationProviderId
  exp: number
}

function signPayload(encoded: string): string {
  return createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(encoded)
    .digest("base64url")
}

export function createOAuthState(input: {
  workspaceId: string
  userId: string
  provider: IntegrationProviderId
}): string {
  const payload: OAuthStatePayload = {
    ...input,
    exp: Date.now() + STATE_TTL_MS,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const sig = signPayload(encoded)
  return `${encoded}.${sig}`
}

export function parseOAuthState(state: string): OAuthStatePayload | null {
  const [encoded, sig] = state.split(".")
  if (!encoded || !sig) return null

  const expected = signPayload(encoded)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as OAuthStatePayload
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function integrationOAuthRedirectUri(): string {
  return `${env.API_URL.replace(/\/$/, "")}/integrations/oauth/callback`
}
