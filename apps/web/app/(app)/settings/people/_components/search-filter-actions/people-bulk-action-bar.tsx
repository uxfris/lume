"use client"

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { SmartKbd } from "@/components/smart-kbd";
import { Table } from "@tanstack/react-table";
import { useShortcutRegister } from "@/components/shortcut-provider";
import { useEffect } from "react";
import { DeletePeoplesDialog } from "./people-delete-dialog";
import { PeopleChangeRole } from "./people-change-role-dialog";


export function PeopleBulkActionBar<TData>({
    table,
    setSelectionMode,
    onRemoveMembers,
    isMutating = false,
}: {
    table: Table<TData>
    setSelectionMode: (mode: boolean) => void
    onRemoveMembers?: (memberIds: string[]) => void
    isMutating?: boolean
}) {
    const selectedCount = table.getFilteredSelectedRowModel().rows.length
    const totalCount = table.getFilteredRowModel().rows.length

    const isAllSelected = table.getIsAllPageRowsSelected()

    const { register } = useShortcutRegister()

    useEffect(() => {
        register("selectall", () => isAllSelected ? table.resetRowSelection() : table.toggleAllPageRowsSelected(true))
    })

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-popover border border-border shadow-lg rounded-sm flex items-center gap-2 p-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-meetings"
                            className="border-foreground"
                            checked={isAllSelected}
                            onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}

                        />
                        <Label
                            htmlFor="select-meetings"
                            className="text-xs text-foreground normal-case hover:underline cursor-pointer whitespace-nowrap">
                            {selectedCount > 0
                                ? `${selectedCount} Selected`
                                : `Select all (${totalCount})`}
                        </Label>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <SmartKbd action={"selectall"} />
                </TooltipContent>
            </Tooltip>
            {
                selectedCount > 0 &&
                <>
                    <PeopleChangeRole table={table} disabled={isMutating} />
                    <DeletePeoplesDialog
                        table={table}
                        onRemoveMembers={onRemoveMembers}
                        isMutating={isMutating}
                    />
                    <VerticalDivider />
                    <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => table.resetRowSelection()}
                    >
                        Clear
                    </Button>
                </>
            }
            <VerticalDivider />
            <Button size="xs" variant="ghost" onClick={() => {
                setSelectionMode(false)
                table.resetRowSelection()
            }}>Cancel</Button>
        </div>
    )
}

function VerticalDivider() {
    return (
        <div className="w-px h-5.5 bg-border" />
    )
}