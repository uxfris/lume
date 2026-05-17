"use client"

import LogoIcon from "@/assets/icons/logo-icon"
import { useCallback, useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  footer: ReactNode
  children: ReactNode
}

export function TwoFactorFullscreenShell({
  open,
  onOpenChange,
  footer,
  children,
}: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [close, open])

  if (!open || !mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-background"
    >
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-md flex-col gap-5">
          <LogoIcon className="h-10 w-10 text-primary" />
          {children}
          <div className="mt-8 flex shrink-0 justify-end">{footer}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function TwoFactorSetupHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="space-y-1.5">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  )
}
