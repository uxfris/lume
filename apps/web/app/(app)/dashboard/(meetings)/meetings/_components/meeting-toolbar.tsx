"use client"

import { MinimalisticMagnifier } from "@solar-icons/react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@workspace/ui/components/input-group"
import { MeetingHostPopover } from "./filter-popovers/meeting-host-popover";
import { MeetingParticipantPopover } from "./filter-popovers/meeting-participant-popover";
import { MeetingTimePopover } from "./filter-popovers/meeting-time-popover";
import { MeetingDurationPopover } from "./filter-popovers/meeting-duration-popover";
import { MeetingSourcePopover } from "./filter-popovers/meeting-source-popover";
import { MeetingSelectionButton } from "./meeting-selection-button";
import { MeetingViewButton } from "./meeting-action/meeting-view-button";
import { cn } from "@workspace/ui/lib/utils";
import { useMeetingListSearch } from "../_stores/meeting-list-search-store";


export function MeetingToolbar({ isCreatedByMe }: { isCreatedByMe?: boolean }) {
    const searchQuery = useMeetingListSearch((s) => s.searchQuery)
    const setSearchQuery = useMeetingListSearch((s) => s.setSearchQuery)

    return (
        <div className="flex items-start lg:items-center gap-3 flex-wrap lg:flex-nowrap">
            <InputGroup className={cn("bg-input shrink-0", isCreatedByMe ? "w-full lg:w-96" : "w-full lg:w-64")}>
                <InputGroupInput
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meetings..."
                    aria-label="Search meetings"
                />
                <InputGroupAddon className="w-5">
                    <MinimalisticMagnifier />
                </InputGroupAddon>
            </InputGroup>
            <div className={cn("w-full grid gap-2", isCreatedByMe ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-6")}>
                {!isCreatedByMe && <MeetingHostPopover />}
                <MeetingParticipantPopover />
                <MeetingTimePopover />
                <MeetingDurationPopover />
                <MeetingSourcePopover isCreatedByMe={isCreatedByMe} />
                <div className="flex items-center gap-2">
                    <MeetingSelectionButton />
                    <MeetingViewButton />
                </div>
            </div>
        </div>
    )
}