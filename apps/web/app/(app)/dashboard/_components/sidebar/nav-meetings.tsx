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

export function NavMeetings({ item }: { item: NavItem }) {
    const pathname = usePathname()
    const isActive = pathname === item.url;
    return (
        <Collapsible className="group/collapsible">
            <SidebarMenuItem
                className={cn("group/trigger px-1 flex items-center hover:bg-sidebar-accent rounded-md gap-0.5",
                    isActive && "bg-sidebar-accent")}>

                {/* ICON ZONE (becomes trigger on hover) */}
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="w-6 h-6 transition bg-sidebar group-data-[state=open]/collapsible:bg-sidebar"
                    >
                        {/* Default icon */}
                        <item.icon className="
                        text-foreground
                            size-3.5
                            opacity-100
                            group-hover/trigger:opacity-0
                            transition
                        " />

                        {/* Chevron on hover */}
                        <ChevronRight className="
                            absolute
                            size-3.5
                            opacity-0
                            group-hover/trigger:opacity-100
                            transition
                            group-data-[state=open]/collapsible:rotate-90
                        " />
                    </Button>
                </CollapsibleTrigger>

                {/* Navigation area*/}
                <SidebarMenuButton asChild tooltip={item.label} className="p-0" isActive={isActive}>
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
                    {[
                        { icon: Hashtag, label: "Sprint Planning", url: "/dashboard/meetings/channel/side-projects", channelId: "side-projects" }

                    ].map((subItem) => (
                        <SidebarMenuSubItem key={subItem.label} className="flex group/channel">
                            <AppSidebarMenuButton item={{
                                ...subItem,
                                badge: <ChannelTitleMenuDropdown isSidebar={true} channelId={subItem.channelId} channelName={subItem.label} />
                            }} />

                        </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    )
}