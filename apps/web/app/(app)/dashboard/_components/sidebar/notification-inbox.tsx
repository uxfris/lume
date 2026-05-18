"use client"

import { Inbox } from "@solar-icons/react"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { SidebarMenuButton } from "@workspace/ui/components/sidebar"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from "../../_hooks/use-notifications"
import type { NotificationItem } from "@workspace/types"

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationItem
  onRead: (id: string) => void
}) {
  const isUnread = item.readAt == null
  const content = (
    <div className="flex flex-col gap-0.5 text-left">
      <span
        className={cn(
          "text-sm leading-snug",
          isUnread ? "font-medium text-foreground" : "text-foreground/90"
        )}
      >
        {item.title}
      </span>
      <span className="line-clamp-2 text-xs text-muted-foreground">
        {item.body}
      </span>
      <span className="text-xs text-muted-foreground/80">
        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </span>
    </div>
  )

  const className = cn(
    "block w-full rounded-md px-3 py-2.5 transition-colors hover:bg-accent",
    isUnread && "bg-accent/40"
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={className}
        onClick={() => {
          if (isUnread) onRead(item.id)
        }}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (isUnread) onRead(item.id)
      }}
    >
      {content}
    </button>
  )
}

export function NotificationInbox() {
  const [open, setOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery()
  const { data, isLoading } = useNotificationsQuery(open)
  const markRead = useMarkNotificationReadMutation()
  const markAllRead = useMarkAllNotificationsReadMutation()

  const hasUnread = unreadCount > 0
  const notifications = data?.notifications ?? []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SidebarMenuButton className="w-auto" tooltip="Notifications">
          <div className="relative">
            <Inbox size={16} />
            {hasUnread ? (
              <span className="absolute top-0 right-0 size-1.5 rounded-full bg-[#FF5252]" />
            ) : null}
          </div>
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <PopoverHeader className="flex flex-row items-center justify-between gap-2 border-b px-3 py-2">
          <PopoverTitle className="text-sm font-semibold">
            Notifications
          </PopoverTitle>
          {hasUnread ? (
            <Button
              variant="ghost"
              size="xs"
              className="h-7 text-xs"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Button>
          ) : null}
        </PopoverHeader>
        <div className="max-h-80 overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="size-5" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onRead={(id) => markRead.mutate(id)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
