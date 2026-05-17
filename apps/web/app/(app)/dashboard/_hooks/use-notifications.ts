"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notificationsApi } from "@workspace/api-client"
import { notificationKeys } from "@/app/(app)/settings/account/_lib/notification.keys"

export function useUnreadNotificationCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
}

export function useNotificationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsApi.list({ limit: 30 }),
    enabled,
    staleTime: 0,
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsApi.markRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
