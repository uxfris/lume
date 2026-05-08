import { prismaAdapter } from "@better-auth/prisma-adapter"
import { betterAuth } from "better-auth"
import { prisma } from "@workspace/database"
import { ensurePersonalWorkspace } from "./workspace-bootstrap"

type AuthConfig = {
  baseUrl: string
  betterAuthSecret: string
  trustedOrigins: string[]

  google: {
    clientId: string
    clientSecret: string
  }

  microsoft: {
    clientId: string
    clientSecret: string
  }

  /**
   * Fires server-side after each new session row is created (e.g. OAuth sign-in).
   * Use for Recall Calendar V2 provisioning without involving the frontend.
   */
  afterSessionCreated?: (input: { userId: string }) => void | Promise<void>
}

export function createAuth(config: AuthConfig) {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    baseURL: config.baseUrl,
    secret: config.betterAuthSecret,
    trustedOrigins: config.trustedOrigins,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    socialProviders: {
      google: {
        clientId: config.google.clientId,
        clientSecret: config.google.clientSecret,
        accessType: "offline",
        prompt: "consent",
        scope: [
          "openid",
          "email",
          "profile",

          //Google Calendar access
          "https://www.googleapis.com/auth/calendar.readonly",
        ],
      },
      microsoft: {
        clientId: config.microsoft.clientId,
        clientSecret: config.microsoft.clientSecret,
        scope: [
          "openid",
          "email",
          "profile",
          "offline_access",

          //Microsoft Graph calendar
          "https://graph.microsoft.com/Calendars.Read",
        ],
      },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await ensurePersonalWorkspace({
              id: user.id,
              name: user.name,
              email: user.email,
            })
          },
        },
      },
      session: {
        create: {
          after: async (session) => {
            await config.afterSessionCreated?.({ userId: session.userId })
          },
        },
      },
    },
  })
}
