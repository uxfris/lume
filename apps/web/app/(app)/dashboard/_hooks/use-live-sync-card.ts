"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { joinMeetingSchema } from "../_components/live-sync/join-meeting-schema"

export function useLiveSyncCard() {
  const [openForm, setOpenForm] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(joinMeetingSchema),
    defaultValues: {
      url: "",
    },
  })

  const joinMeeting = (data: { url: string }) => {
    setOpenForm(true)
  }

  const onSuccess = (meetingUrl: string) => {
    setOpenForm(false)
    setOpenSuccess(true)
  }
  return {
    form,
    joinMeeting,
    openForm,
    setOpenForm,
    onSuccess,
    openSuccess,
    setOpenSuccess,
  }
}
