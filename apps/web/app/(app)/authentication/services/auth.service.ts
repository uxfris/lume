import { authClient } from "@/lib/auth-client"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export function loginWithMicrosoft() {
  authClient.signIn.social({
    provider: "microsoft",
    callbackURL: `${APP_URL}/dashboard`,
  })
}

export function loginWithGoogle(): ReturnType<typeof authClient.signIn.social> {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: `${APP_URL}/dashboard`,
  })
}
