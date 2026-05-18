"use client"

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { integrationsApi } from "@workspace/api-client";
import { toast } from "sonner";

export function IntegrationConnectCard({
    description,
    platform,
    provider,
}: {
    description: string
    platform: string
    provider: "slack" | "linear"
}) {
    async function handleConnect() {
        try {
            const { url } = await integrationsApi.getOAuthUrl(provider)
            window.location.href = url
        } catch {
            toast.error(`Could not start ${platform} connection. Check server OAuth configuration.`)
        }
    }

    return (
        <Card>
            <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
                <Button variant="outline" className="w-full" onClick={handleConnect}>
                    Connect {platform}
                </Button>
            </CardContent>
        </Card>
    )
}
