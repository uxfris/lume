import { Bolt } from "@solar-icons/react"
import { SidebarMenuButton, SidebarMenuItem } from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { routes } from "@/lib/routes"

export default function NavUpgrade() {
    return (
        <SidebarMenuItem className="transition-opacity duration-500 group-data-[state=collapsed]:opacity-0">
            <SidebarMenuButton asChild className="justify-between border border-foreground/10 rounded-lg py-7 px-3 hover:bg-primary/10">
            <Link href={routes.settings.billing}>
                <div className="flex flex-col">
                    <span className="truncate text-sm font-semibold">Upgrade to Pro</span>
                    <span className=" truncate text-xs text-muted-foreground">Unlock more benefits</span>
                </div>
                <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-full truncate">
                    <Bolt size={5} weight="Bold" />
                </div>
            </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}