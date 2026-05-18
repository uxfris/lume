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

//Mock data

const MockIntegrationList = [
  {
    id: "4",
    icon: "/vectors/jira.svg",
    label: "Jira Projects",
    isConnected: false,
  },
  {
    id: "1",
    icon: "/vectors/asana.svg",
    label: "Asana",
    isConnected: false,
  },
  {
    id: "2",
    icon: "/vectors/clickup.svg",
    label: "ClickUp",
    isConnected: false,
  },
  {
    id: "5",
    icon: "/vectors/linear-app.svg",
    label: "Linear App",
    isConnected: true,
    feature: "Send tasks",
  },
  //   {
  //     id: "3",
  //     icon: "/vectors/googletasks.svg",
  //     label: "Google Tasks",
  //     isConnected: false,
  //   },

  //   {
  //     id: "6",
  //     icon: "/vectors/ms-planner.svg",
  //     label: "Microsoft Planner",
  //     isConnected: false,
  //   },
  //   {
  //     id: "7",
  //     icon: "/vectors/ms-todo.svg",
  //     label: "Microsoft To Do",
  //     isConnected: false,
  //   },
  //   {
  //     id: "8",
  //     icon: "/vectors/trello.svg",
  //     label: "Trello",
  //     isConnected: true,
  //     feature: "Send tasks",
  //   },
]

export function TaskSync({
  openTaskSelectionDialog,
}: {
  openTaskSelectionDialog: (areInitiallySelected: boolean) => void
}) {
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
          {MockIntegrationList.map((item) =>
            !item.isConnected ? (
              <DropdownMenuItem
                key={item.id}
                className="gap-3"
                onSelect={() => console.log("menu is clicked", item.label)}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={14}
                  height={14}
                />
                <div className="flex-1">
                  <h5 className="text-sm font-medium">{item.label}</h5>
                  <p className="text-xs text-muted-foreground">Connect</p>
                </div>
                <LinkMinimalistic />
              </DropdownMenuItem>
            ) : (
              <DropdownMenuSub key={item.id}>
                <DropdownMenuSubTrigger className="gap-3">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={14}
                    height={14}
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h5 className="text-sm font-medium">{item.label}</h5>
                      <CheckCircle
                        weight="Bold"
                        className="text-green-300 dark:text-green-600"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.feature}
                    </p>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onSelect={() => openTaskSelectionDialog(true)}
                  >
                    Send my taks
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openTaskSelectionDialog(true)}
                  >
                    Send all taks
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openTaskSelectionDialog(false)}
                  >
                    Select tasks
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
