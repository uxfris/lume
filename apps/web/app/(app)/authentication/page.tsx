"use client"

import React, { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Spinner } from "@workspace/ui/components/spinner"
import { authClient } from "@/lib/auth-client"
import { routes } from "@/lib/routes"
import { AuthHeader } from "./components/auth-header"
import { TermCheckbox } from "./components/term-checkbox"
import { useAuthForm } from "./hooks/use-auth-form"
import { AuthButtons } from "./components/auth-buttons"
import { loginWithGoogle, loginWithMicrosoft } from "./services/auth.service"
import { useAuthController } from "./hooks/use-auth-controller"
import { AUTH_PROVIDERS } from "./config/auth-providers"

function resolveRedirectPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next
  }
  return routes.dashboard.root
}

export default function AuthenticationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { form, showEmail, setShowEmail, requireAgreement } = useAuthForm()
  const { loadingProvider, handleAuth } = useAuthController()

  useEffect(() => {
    if (isSessionPending || !session) return
    router.replace(resolveRedirectPath(next))
  }, [isSessionPending, next, router, session])

  if (isSessionPending || session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-4 flex w-full flex-col items-center gap-9 rounded-md bg-card px-4 py-16 md:max-w-126.5">
        <AuthHeader />
        <div className="flex w-full flex-col gap-3 px-4 md:px-12">
          <AuthButtons
            providers={AUTH_PROVIDERS.filter((p) =>
              p.id === "email" ? !showEmail : true
            ).map((provider) => ({
              ...provider,
              onClick: async () => {
                const ok = await requireAgreement()
                if (!ok) return

                if (provider.id === "google") {
                  await handleAuth(provider.id, () => loginWithGoogle(next))
                }
                if (provider.id === "microsoft") {
                  await handleAuth(provider.id, () => loginWithMicrosoft(next))
                }
                if (provider.id === "email") {
                  setShowEmail(true)
                }
              },
              loading: loadingProvider === provider.id,
            }))}
          />
          {/* {showEmail && (
                        <EmailForm form={form} onSubmit={form.handleSubmit(handleEmailSubmit)} />
                    )}
                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>} */}
        </div>
        <TermCheckbox form={form} />
      </div>
    </div>
  )
}
