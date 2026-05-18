"use client"

import { IntegrationStatusEnum } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Separator } from "@workspace/ui/components/separator";
import { Check, ChevronDown, } from "lucide-react";
import { useIntegrationListStatus } from "../../_stores/integration-list-status-store";


export function IntegrationStatusPopover() {
    const status = useIntegrationListStatus((s) => s.status)
    const setStatus = useIntegrationListStatus((s) => s.setStatus)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="xs" className="w-full md:w-fit justify-between text-muted-foreground">
                    {status ?? "Any status"}
                    <ChevronDown />
                </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-40 px-1">
                <PopoverHeader>
                    <PopoverTitle className="px-3">
                        Status
                    </PopoverTitle>
                </PopoverHeader>
                <Separator />
                <div>
                    <button
                        type="button"
                        className="flex w-full items-center p-3 hover:bg-secondary rounded-md"
                        onClick={() => setStatus(null)}
                    >
                        <span className="flex-1 text-left">Any status</span>
                        {!status && <Check size={16} />}
                    </button>
                    {
                        IntegrationStatusEnum.options.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className="flex w-full items-center p-3 hover:bg-secondary rounded-md"
                                onClick={() => setStatus(item)}
                            >
                                <span className="flex-1 text-left capitalize">{item}</span>
                                {status === item && <Check size={16} />}
                            </button>
                        ))
                    }
                </div>
            </PopoverContent>
        </Popover>
    )
}
