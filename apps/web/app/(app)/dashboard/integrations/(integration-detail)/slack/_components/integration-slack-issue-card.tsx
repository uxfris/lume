"use client"

import { InfoCircle } from "@solar-icons/react/ssr";
import { Button } from "@workspace/ui/components/button";

export function IntegrationSlackIssueCard({
    channelName,
    onFixPermission,
    onChangeChannel,
}: {
    channelName: string
    onFixPermission: () => void
    onChangeChannel: () => void
}) {
    return (
        <div className="px-5 py-3 space-y-3 rounded-lg bg-destructive/10 border border-destructive">
            <div className="flex items-center gap-1.5">
                <InfoCircle className="text-destructive" />
                <span className="text-sm text-destructive">
                    The bot no longer has access to <span className="font-semibold">{channelName}</span>. Re-authorize or select a different channel.
                </span>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="xs"
                    className="border-foreground/20"
                    onClick={onFixPermission}
                >
                    Fix Permission
                </Button>
                <Button
                    variant="outline"
                    size="xs"
                    className="border-foreground/20"
                    onClick={onChangeChannel}
                >
                    Change channel
                </Button>
            </div>
        </div>
    )
}
