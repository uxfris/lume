"use client"

import { useEffect, useState } from "react"

import type { ChannelType } from "@workspace/types"

type UseChannelFormProps = {
  open: boolean
  initialName?: string
  initialType?: ChannelType
}

export function useChannelForm({
  open,
  initialName,
  initialType,
}: UseChannelFormProps) {
  const [title, setTitle] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    if (!open) return

    setTitle(initialName ?? "")
    setIsPrivate(initialType === "PRIVATE")
  }, [open, initialName, initialType])

  return {
    title,
    setTitle,

    isPrivate,
    setIsPrivate,
  }
}
