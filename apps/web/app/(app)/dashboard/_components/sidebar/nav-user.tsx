import {
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { DropdownUserMenu } from "./nav-dropdown-user-menu"
import { NotificationInbox } from "./notification-inbox"

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
      <NotificationInbox />
    </SidebarMenuItem>
  )
}
