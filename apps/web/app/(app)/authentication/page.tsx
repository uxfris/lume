"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { AuthHeader } from "./components/auth-header"
import { TermCheckbox } from "./components/term-checkbox"
import { useAuthForm } from "./hooks/use-auth-form"
import { AuthButtons } from "./components/auth-buttons"
import { loginWithGoogle, loginWithMicrosoft } from "./services/auth.service"
import { useAuthController } from "./hooks/use-auth-controller"
import { AUTH_PROVIDERS } from "./config/auth-providers"

export default function AuthenticationPage() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next")
  const { form, showEmail, setShowEmail, requireAgreement } = useAuthForm()
  const { loadingProvider, handleAuth } = useAuthController()

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
