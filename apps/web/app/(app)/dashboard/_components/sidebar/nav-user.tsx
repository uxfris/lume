import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { DropdownUserMenu } from "./nav-dropdown-user-menu"
import { Inbox } from "@solar-icons/react"

export function NavUser() {
  const { state } = useSidebar()
  return (
    <SidebarMenuItem
      className={cn(
        "flex items-center justify-between",
        state === "collapsed" && "flex-col"
      )}
    >
      <DropdownUserMenu />
      <SidebarMenuButton className="w-auto">
        <div className="relative">
          <Inbox size={16} />
          <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-[#FF5252]" />
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
