import { Button } from "@workspace/ui/components/button";
import { PeopleRoleDropdownMenu } from "./people-role-dropdown-menu";
import { AltArrowDown } from "@solar-icons/react";
import { Table } from "@tanstack/react-table";
import type { ApiWorkspaceRole } from "@workspace/types";

export function PeopleChangeRole<TData>({
    table,
    disabled = false,
}: {
    table: Table<TData>
    disabled?: boolean
}) {
    return (
        <PeopleRoleDropdownMenu
            assignableOnly
            disabled={disabled}
            actorRole={table.options.meta?.actorRole as ApiWorkspaceRole | undefined}
            onSelectRole={(role) => void table.options.meta?.updateMultipleRoles?.(role)}
            hasHeader={true} triggerButton={
                <Button size="xs" variant="ghost">
                    Change role
                    <AltArrowDown />
                </Button>
            } />
    )
}