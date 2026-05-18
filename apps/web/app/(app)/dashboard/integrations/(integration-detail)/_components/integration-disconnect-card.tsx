"use client"

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { integrationsApi } from "@workspace/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { integrationsKeys } from "../../_lib/integrations.keys";
import { toast } from "sonner";

export function IntegrationDisconnectCard({
    label,
    value,
    provider,
}: {
    label: string
    value: string
    provider: "slack" | "linear"
}) {
    const queryClient = useQueryClient()

    async function handleDisconnect() {
        try {
            await integrationsApi.disconnect(provider)
            await queryClient.invalidateQueries({ queryKey: integrationsKeys.all })
            toast.success("Disconnected")
        } catch {
            toast.error("Could not disconnect")
        }
    }

    return (
        <Card className="py-2">
            <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm">
                    {label} <span className="font-semibold">{value}</span>
                </p>
                <Button variant="outline" size="xs" onClick={handleDisconnect}>
                    Disconnect
                </Button>
            </CardContent>
        </Card>
    )
}
