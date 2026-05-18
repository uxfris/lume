import { Button } from "@workspace/ui/components/button";
import { PeopleRoleDropdownMenu } from "./people-role-dropdown-menu";
import { AltArrowDown } from "@solar-icons/react";
import { Table } from "@tanstack/react-table";

export function PeopleChangeRole<TData>({ table }: { table: Table<TData> }) {


    return (
        <PeopleRoleDropdownMenu
            assignableOnly
            onSelectRole={(role) => table.options.meta?.updateMultipleRoles?.(role)}
            hasHeader={true} triggerButton={
                <Button size="xs" variant="ghost">
                    Change role
                    <AltArrowDown />
                </Button>
            } />
    )
}