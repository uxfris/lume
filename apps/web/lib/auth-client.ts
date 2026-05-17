import { phoneNumberClient, twoFactorClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

function createLumeAuthClient() {
  return createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    plugins: [twoFactorClient(), phoneNumberClient()],
  })
}

export const authClient = createLumeAuthClient()

export type AuthClient = ReturnType<typeof createLumeAuthClient>
export type AuthSession = AuthClient["$Infer"]["Session"]
