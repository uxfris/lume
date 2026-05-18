"use client";

import { ColumnDef, Table } from "@tanstack/react-table";
import { ChevronsUpDown, MoreHorizontal, } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { ApiWorkspaceRole, WorkspaceMember } from "@workspace/types";
import { useState } from "react";
import { formatDateOnly } from "@/lib/date-format";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { PeopleRoleDropdownMenu } from "../search-filter-actions/people-role-dropdown-menu";
import { AltArrowDown } from "@solar-icons/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { ROLES } from "../../_lib/role-data";
import { cn } from "@workspace/ui/lib/utils";

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function formatRole(role: string) {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

function PeopleMemberActionsCell({
    member,
    table,
}: {
    member: WorkspaceMember
    table: Table<WorkspaceMember>
}) {
    const [leaveOpen, setLeaveOpen] = useState(false)
    const [removeOpen, setRemoveOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="w-full flex items-center justify-end">
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-fit">
                    {member.isCurrentUser ? (
                        <DropdownMenuItem
                            className="text-sm font-medium px-4 py-3 text-destructive"
                            onSelect={(event) => {
                                event.preventDefault()
                                setLeaveOpen(true)
                            }}
                        >
                            Leave workspace
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            className="text-sm font-medium px-4 py-3 text-destructive"
                            onSelect={(event) => {
                                event.preventDefault()
                                setRemoveOpen(true)
                            }}
                        >
                            Remove Member
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave workspace?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will lose access to this workspace&apos;s projects and resources.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => table.options.meta?.leaveWorkspace?.()}
                        >
                            Leave workspace
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {member.name} will be removed from this workspace and lose access to shared projects.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => table.options.meta?.removeMember?.(member.id)}
                        >
                            Remove member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}


/* ---------------------------------- */
/* Columns */
/* ---------------------------------- */

export const peopleColumns: ColumnDef<WorkspaceMember>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => {
            if (!row.getCanSelect()) return null

            return (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",

        header: ({ column }) => (
            <Button
                variant="ghost"
                className="hover:bg-transparent px-0 pr-2"
                onClick={() =>
                    column.toggleSorting(
                        column.getIsSorted() === "asc"
                    )
                }
            >
                Name
                <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),

        cell: ({ row }) => {
            const member = row.original;

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback>
                            {member.avatarInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{member.name} {member.isCurrentUser && " (you)"}</span>
                        <span className="text-muted-foreground text-xs">
                            {member.email}
                        </span>
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: "role",

        header: ({ column }) => (
            <Button
                variant="ghost"
                className="hover:bg-transparent px-3.5"
                onClick={() =>
                    column.toggleSorting(
                        column.getIsSorted() === "asc"
                    )
                }
            >
                Role
                <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row, table }) => {
            const isSelf = (row.original as WorkspaceMember).isCurrentUser
            const member = row.original
            const canManage = table.options.meta?.canManageMembers !== false

            if (!canManage) {
                return (
                    <span className="text-sm capitalize">{formatRole(member.role)}</span>
                )
            }

            return (
                <PeopleRoleDropdownMenu
                    assignableOnly
                    actorRole={table.options.meta?.actorRole as ApiWorkspaceRole | undefined}
                    onSelectRole={(role) => table.options.meta?.updateRole?.(member.id, role)}
                    triggerButton={
                        <span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className={cn("inline-block", isSelf ? " cursor-not-allowed" : "cursor-pointer")}>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="font-normal"
                                            disabled={isSelf}
                                        >
                                            <span className="flex items-center gap-1">
                                                {formatRole(row.original.role)}
                                                <AltArrowDown />
                                            </span>
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="border">
                                    <p className="max-w-xs text-xs">
                                        {isSelf
                                            ? "You cannot change your own role."
                                            : ROLES.find((r) => r.id === row.original.role)?.description}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </span>

                    }
                />
            )
        },
    },

    {
        accessorKey: "joinedAt",

        header: ({ column }) => (
            <Button
                variant="ghost"
                className="hover:bg-transparent px-0 pr-2"
                onClick={() =>
                    column.toggleSorting(
                        column.getIsSorted() === "asc"
                    )
                }
            >
                Joined Date
                <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),

        cell: ({ row }) =>
            <span className="text-sm text-muted-foreground">{formatDateOnly(row.original.joinedAt)}</span>,
    },

    {
        id: "actions",

        enableSorting: false,

        cell: ({ row, table }) => (
            <PeopleMemberActionsCell member={row.original} table={table} />
        ),
    },
];