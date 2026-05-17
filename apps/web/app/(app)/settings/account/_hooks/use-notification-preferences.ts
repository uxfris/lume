"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notificationsApi } from "@workspace/api-client"
import type { UpdateNotificationPreferencesBody } from "@workspace/types"
import { notificationKeys } from "../_lib/notification.keys"

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
    staleTime: 30_000,
  })
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateNotificationPreferencesBody) =>
      notificationsApi.updatePreferences(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
