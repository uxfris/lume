import { authClient } from "@/lib/auth-client"
import { routes } from "@/lib/routes"

function resolveCallbackUrl(next?: string | null): string {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "")

  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return `${appUrl}${next}`
  }

  return `${appUrl}${routes.dashboard.root}`
}

export function loginWithMicrosoft(next?: string | null) {
  authClient.signIn.social({
    provider: "microsoft",
    callbackURL: resolveCallbackUrl(next),
  })
}

export function loginWithGoogle(
  next?: string | null
): ReturnType<typeof authClient.signIn.social> {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: resolveCallbackUrl(next),
  })
}
