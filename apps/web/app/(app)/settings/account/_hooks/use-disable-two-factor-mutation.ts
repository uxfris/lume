"use client"

import { authClient } from "@/lib/auth-client"
import { useMutation } from "@tanstack/react-query"
import { getAuthErrorMessage } from "../_lib/two-factor"

export function useDisableTwoFactorMutation() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.twoFactor.disable({})
      if (error) {
        throw new Error(getAuthErrorMessage(error, "Failed to disable 2FA"))
      }
      return data
    },
    onSuccess: async () => {
      await authClient.getSession()
    },
  })
}
