import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import { NavItem } from "../../_types/nav-item"
import { ChevronRight } from "lucide-react"
import { AppSidebarMenuButton } from "./nav-item"
import { Button } from "@workspace/ui/components/button"
import { Hashtag } from "@solar-icons/react"
import { NavAddChannel } from "./nav-add-channel"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { ChannelTitleMenuDropdown } from "../../(meetings)/meetings/channel/_components/meeting-channel-title-menu-dropdown"
import { channelApi } from "@workspace/api-client"
import { useQuery } from "@tanstack/react-query"

export function NavMeetings({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.url

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: () => channelApi.getChannels(),
    staleTime: 300_000,
  })

  return (
    <Collapsible className="group/collapsible">
      <SidebarMenuItem
        className={cn(
          "group/trigger flex items-center gap-0.5 rounded-md px-1 hover:bg-sidebar-accent",
          isActive && "bg-sidebar-accent"
        )}
      >
        {/* ICON ZONE (becomes trigger on hover) */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 bg-sidebar transition group-data-[state=open]/collapsible:bg-sidebar"
          >
            {/* Default icon */}
            <item.icon className="size-3.5 text-foreground opacity-100 transition group-hover/trigger:opacity-0" />

            {/* Chevron on hover */}
            <ChevronRight className="absolute size-3.5 opacity-0 transition group-hover/trigger:opacity-100 group-data-[state=open]/collapsible:rotate-90" />
          </Button>
        </CollapsibleTrigger>

        {/* Navigation area*/}
        <SidebarMenuButton
          asChild
          tooltip={item.label}
          className="p-0"
          isActive={isActive}
        >
          <Link href={item.url} className="flex items-center gap-2">
            <span className="flex-1 text-sm transition-all duration-200 ease-out group-data-[state=collapsed]:opacity-0">
              Meetings
            </span>
            {/* <span className="ml-0">{item.label}</span> */}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <CollapsibleContent>
        <SidebarMenuSub className="border-zinc-200 dark:border-zinc-800">
          <SidebarMenuSubItem>
            <NavAddChannel />
          </SidebarMenuSubItem>
          {!isLoading &&
            channels.map((item) => {
              const channel = {
                id: item.id,
                icon: Hashtag,
                label: item.name,
                url: `/dashboard/meetings/channel/${item.id}`,
              }
              return (
                <SidebarMenuSubItem
                  key={channel.label}
                  className="group/channel flex"
                >
                  <AppSidebarMenuButton
                    item={{
                      ...channel,
                      badge: (
                        <ChannelTitleMenuDropdown
                          isSidebar={true}
                          channelId={channel.id}
                          channelName={channel.label}
                        />
                      ),
                    }}
                  />
                </SidebarMenuSubItem>
              )
            })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
