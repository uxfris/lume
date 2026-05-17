import { prismaAdapter } from "@better-auth/prisma-adapter"
import { betterAuth } from "better-auth"
import { phoneNumber } from "better-auth/plugins"
import { twoFactor } from "better-auth/plugins"
import { prisma } from "@workspace/database"
import { createTwilioSmsSender, type TwilioConfig } from "./twilio-sms"
import { ensurePersonalWorkspace } from "./workspace-bootstrap"

type AuthConfig = {
  baseUrl: string
  betterAuthSecret: string
  trustedOrigins: string[]
  appName: string

  google: {
    clientId: string
    clientSecret: string
  }

  microsoft: {
    clientId: string
    clientSecret: string
  }

  twilio?: TwilioConfig

  /**
   * Fires server-side after each new session row is created (e.g. OAuth sign-in).
   * Use for Recall Calendar V2 provisioning without involving the frontend.
   */
  afterSessionCreated?: (input: { userId: string }) => void | Promise<void>
}

export function createAuth(config: AuthConfig) {
  const sendSms = config.twilio
    ? createTwilioSmsSender(config.twilio)
    : async (to: string, body: string) => {
        console.warn(
          `[auth] Twilio is not configured; SMS not sent to ${to}: ${body}`
        )
      }

  const sendOtpSms = async (phoneNumber: string, code: string) => {
    await sendSms(
      phoneNumber,
      `Your ${config.appName} verification code is: ${code}`
    )
  }

  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    baseURL: config.baseUrl,
    secret: config.betterAuthSecret,
    trustedOrigins: config.trustedOrigins,
    appName: config.appName,

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
    plugins: [
      phoneNumber({
        sendOTP: ({ phoneNumber, code }) => {
          void sendOtpSms(phoneNumber, code)
        },
        otpLength: 6,
        expiresIn: 300,
      }),
      twoFactor({
        issuer: config.appName,
        allowPasswordless: true,
        otpOptions: {
          sendOTP: ({ user, otp }) => {
            const destination =
              "phoneNumber" in user &&
              typeof user.phoneNumber === "string" &&
              user.phoneNumber.length > 0
                ? user.phoneNumber
                : null
            if (!destination) {
              throw new Error("User has no phone number for SMS 2FA")
            }
            void sendOtpSms(destination, otp)
          },
          period: 5,
          storeOTP: "encrypted",
        },
      }),
    ],
    advanced: {
      // cookies: {
      //   state: {
      //     attributes: {
      //       sameSite: "none",
      //       secure: true,
      //     },
      //   },
      // },
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
