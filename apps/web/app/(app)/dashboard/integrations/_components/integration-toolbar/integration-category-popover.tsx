"use client"

import { IntegrationCategoryEnum } from "@workspace/types";
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
import { useIntegrationListCategory } from "../../_stores/integration-list-category-store";


export function IntegrationCategoryPopover() {
    const category = useIntegrationListCategory((s) => s.category)
    const setCategory = useIntegrationListCategory((s) => s.setCategory)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="xs" className="w-full md:w-fit justify-between text-muted-foreground">
                    {category ?? "Any integration"}
                    <ChevronDown />
                </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" className="w-52 px-1">
                <PopoverHeader>
                    <PopoverTitle className="px-3">
                        Integration category
                    </PopoverTitle>
                </PopoverHeader>
                <Separator />
                <div>
                    <button
                        type="button"
                        className="flex w-full items-center p-3 hover:bg-secondary rounded-md"
                        onClick={() => setCategory(null)}
                    >
                        <span className="flex-1 text-left">Any integration</span>
                        {!category && <Check size={16} />}
                    </button>
                    {
                        IntegrationCategoryEnum.options.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className="flex w-full items-center p-3 hover:bg-secondary rounded-md"
                                onClick={() => setCategory(item)}
                            >
                                <span className="flex-1 text-left">{item}</span>
                                {category === item && <Check size={16} />}
                            </button>
                        ))
                    }
                </div>
            </PopoverContent>
        </Popover>
    )
}
