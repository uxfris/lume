"use client"

import {
  Home,
  Logout,
  Monitor,
  Moon,
  PaintRoller,
  Settings,
  Sun,
  User,
} from "@solar-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { SidebarMenuButton } from "@workspace/ui/components/sidebar"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import { useTheme } from "next-themes"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { routes } from "@/lib/routes"
import Link from "next/link"
import { getInitial } from "@/lib/get-initial"

export function DropdownUserMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const { data: session } = authClient.useSession()

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          useCurrentWorkspace().setWorkspaceId(null)
          router.push(routes.authentication)
        },
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="w-8 items-center justify-center rounded-full bg-primary p-0 hover:bg-primary">
          <Avatar
            className={cn(
              "flex size-5 h-full w-full items-center justify-center bg-primary",
              className
            )}
          >
            {session?.user.image && <AvatarImage src={session?.user.image} />}
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
              {getInitial(session?.user.name)}
            </AvatarFallback>
          </Avatar>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="py-2 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {session?.user.image && <AvatarImage src={session?.user.image} />}
              <AvatarFallback className="rounded-lg">
                {getInitial(session?.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground">
                {session?.user.name}
              </span>
              <span className="truncate text-xs">{session?.user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="text-sm font-medium text-foreground">
          <DropdownMenuItem className="py-2" asChild>
            <Link href={routes.settings.account}>
              <User />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="py-2" asChild>
            <Link href={routes.settings.root}>
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex w-full items-center py-2">
              <PaintRoller />
              Appearance
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) => {
                      setTheme(value)
                    }}
                  >
                    <DropdownMenuRadioItem value="light">
                      <Sun />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <Monitor />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem className="py-2" asChild>
            <Link href="/">
              <Home />
              Homepage
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => signOut()}
          className="py-2 text-sm font-medium text-foreground"
        >
          <Logout />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
