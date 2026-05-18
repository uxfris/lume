"use client"

import { Button } from "@workspace/ui/components/button"
import { ArrowRightLeft } from "lucide-react"
import { CheckCircle, LinkMinimalistic } from "@solar-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import Image from "next/image"
import { integrationsApi } from "@workspace/api-client"
import { useIntegrationsQuery } from "../../integrations/_hooks/queries/use-integrations-query"
import type { TaskSyncSelectionMode } from "@workspace/types"
import { toast } from "sonner"

const LINEAR_PROVIDER = {
  id: "linear" as const,
  icon: "/vectors/linear-app.svg",
  label: "Linear",
}

export function TaskSync({
  openTaskSelection,
}: {
  openTaskSelection: (mode: TaskSyncSelectionMode) => void
}) {
  const { data, isLoading } = useIntegrationsQuery()
  const linear = data?.integrations.find(
    (integration) => integration.id === LINEAR_PROVIDER.id
  )
  const isConnected = linear?.status === "connected"

  async function handleConnect() {
    try {
      const { url } = await integrationsApi.getOAuthUrl("linear")
      window.location.href = url
    } catch {
      toast.error(
        "Could not start Linear connection. Check server OAuth configuration."
      )
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="hidden md:flex">
          <ArrowRightLeft />
          Sync to
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="sm:min-w-52">
        <DropdownMenuGroup className="space-y-2">
          <DropdownMenuLabel>Project Destination</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
            <DropdownMenuItem disabled>Loading integrations...</DropdownMenuItem>
          ) : !isConnected ? (
            <DropdownMenuItem className="gap-3" onSelect={handleConnect}>
              <Image
                src={LINEAR_PROVIDER.icon}
                alt={LINEAR_PROVIDER.label}
                width={14}
                height={14}
              />
              <div className="flex-1">
                <h5 className="text-sm font-medium">{LINEAR_PROVIDER.label}</h5>
                <p className="text-xs text-muted-foreground">Connect</p>
              </div>
              <LinkMinimalistic />
            </DropdownMenuItem>
          ) : (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-3">
                <Image
                  src={LINEAR_PROVIDER.icon}
                  alt={LINEAR_PROVIDER.label}
                  width={14}
                  height={14}
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h5 className="text-sm font-medium">
                      {LINEAR_PROVIDER.label}
                    </h5>
                    <CheckCircle
                      weight="Bold"
                      className="text-green-300 dark:text-green-600"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Send tasks</p>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => openTaskSelection("mine")}>
                  Send my tasks
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openTaskSelection("all")}>
                  Send all tasks
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => openTaskSelection("select")}>
                  Select tasks
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
