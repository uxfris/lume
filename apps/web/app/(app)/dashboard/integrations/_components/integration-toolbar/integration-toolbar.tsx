"use client"

import { MinimalisticMagnifier } from "@solar-icons/react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@workspace/ui/components/input-group"
import { IntegrationViewButton } from "./integration-view-button";
import { IntegrationCategoryPopover } from "./integration-category-popover";
import { IntegrationStatusPopover } from "./integration-status-popover";
import { useIntegrationListSearch } from "../../_stores/integration-list-search-store";


export function IntegrationToolbar() {
    const searchQuery = useIntegrationListSearch((s) => s.searchQuery)
    const setSearchQuery = useIntegrationListSearch((s) => s.setSearchQuery)

    return (
        <div className="flex items-start lg:items-center gap-3 flex-wrap lg:flex-nowrap px-4 md:px-10">
            <div className="flex flex-1 flex-col md:flex-row items-start md:items-center gap-3">
                <InputGroup className="bg-input w-full lg:w-64">
                    <InputGroupInput
                        placeholder="Search integrations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <InputGroupAddon className="w-5">
                        <MinimalisticMagnifier />
                    </InputGroupAddon>
                </InputGroup>
                <IntegrationCategoryPopover />
                <IntegrationStatusPopover />
            </div>
            <IntegrationViewButton />
        </div>
    )
}
