"use client"

import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { ApiError, notificationsApi } from "@workspace/api-client"
import { notificationKeys } from "@/app/(app)/settings/account/_lib/notification.keys"

type NotificationCountContext = Awaited<
  ReturnType<typeof notificationsApi.getUnreadCount>
>
export function useUnreadNotificationCountQuery(): UseQueryResult<NotificationCountContext> {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
}

type NotificationsContext = Awaited<ReturnType<typeof notificationsApi.list>>

export function useNotificationsQuery(
  enabled: boolean
): UseQueryResult<NotificationsContext> {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsApi.list({ limit: 30 }),
    enabled,
    staleTime: 0,
  })
}

type MarkNotificationResponse = Awaited<
  ReturnType<typeof notificationsApi.markRead>
>

export function useMarkNotificationReadMutation(): UseMutationResult<
  MarkNotificationResponse,
  ApiError,
  string
> {
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
