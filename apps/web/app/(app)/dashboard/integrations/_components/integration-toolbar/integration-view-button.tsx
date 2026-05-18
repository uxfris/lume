"use client"

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Grid2x2, List } from "lucide-react";
import { useIntegrationListView } from "../../_stores/integration-list-view-store";


export function IntegrationViewButton() {
    const view = useIntegrationListView((s) => s.view)
    const setView = useIntegrationListView((s) => s.setView)

    return (
        <div className="hidden md:flex items-center gap-1 p-1 bg-secondary rounded-lg">
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-auto w-auto p-1", view === "grid" && "bg-card")}
                onClick={() => setView("grid")}>
                <Grid2x2 size={16} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-auto w-auto p-1", view === "list" && "bg-card")}
                onClick={() => setView("list")}>
                <List size={16} />
            </Button>
        </div>
    )
}
