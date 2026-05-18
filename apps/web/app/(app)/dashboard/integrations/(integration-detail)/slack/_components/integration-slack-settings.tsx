"use client"

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { IntegrationSettingItem } from "../../_components/integration-setting-item";
import type { SlackIntegrationConfig } from "@workspace/types";
import { integrationsApi } from "@workspace/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { integrationsKeys } from "../../../_lib/integrations.keys";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function IntegrationSlackSettings({
    config,
}: {
    config: SlackIntegrationConfig
}) {
    const queryClient = useQueryClient()
    const { workspaceId } = useCurrentWorkspace()
    const [draft, setDraft] = useState(config)
    const [channelOpen, setChannelOpen] = useState(false)

    useEffect(() => {
        setDraft(config)
    }, [config])

    const channelsQuery = useQuery({
        queryKey: integrationsKeys.channels(workspaceId, "slack"),
        queryFn: () => integrationsApi.listChannels("slack"),
        enabled: channelOpen,
    })

    async function patchSettings(patch: Partial<SlackIntegrationConfig>) {
        const previous = draft
        setDraft((current) => ({ ...current, ...patch }))
        try {
            await integrationsApi.patchSlackSettings(patch)
            await queryClient.invalidateQueries({
                queryKey: integrationsKeys.detail(workspaceId, "slack"),
            })
        } catch {
            setDraft(previous)
            toast.error("Could not save settings")
        }
    }

    async function selectChannel(channelId: string, channelName: string) {
        const previous = draft
        const channelLabel = `#${channelName}`
        setDraft((current) => ({
            ...current,
            defaultChannelId: channelId,
            defaultChannelName: channelLabel,
        }))
        setChannelOpen(false)
        try {
            await integrationsApi.setSlackChannel({
                channelId,
                channelName: channelLabel,
            })
            await queryClient.invalidateQueries({
                queryKey: integrationsKeys.detail(workspaceId, "slack"),
            })
            toast.success("Channel updated")
        } catch {
            setDraft(previous)
            toast.error("Could not update channel")
        }
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xs text-muted-foreground uppercase">Settings</h2>
            <Card>
                <CardContent className="space-y-4">
                    <IntegrationSettingItem
                        id="channel"
                        label="Default channel"
                        description="Where summaries are posted after each meeting"
                        trailing={
                            <div className="flex items-center gap-4">
                                <Badge variant="outline">
                                    {draft.defaultChannelName ?? "Not set"}
                                </Badge>
                                <Dialog open={channelOpen} onOpenChange={setChannelOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="xs">
                                            Change
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Select channel</DialogTitle>
                                        </DialogHeader>
                                        <div className="max-h-64 overflow-y-auto space-y-1">
                                            {channelsQuery.isLoading && (
                                                <p className="text-sm text-muted-foreground">Loading…</p>
                                            )}
                                            {channelsQuery.data?.channels.map((ch) => (
                                                <button
                                                    key={ch.id}
                                                    type="button"
                                                    className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-secondary"
                                                    onClick={() => selectChannel(ch.id, ch.name)}
                                                >
                                                    #{ch.name}
                                                </button>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        }
                    />
                    <Separator />
                    <IntegrationSettingItem
                        id="auto-post"
                        label="Post summaries automatically"
                        description="Send without requiring manual approval"
                        trailing={
                            <Switch
                                checked={draft.autoPostSummaries}
                                onCheckedChange={(checked) =>
                                    patchSettings({ autoPostSummaries: checked })
                                }
                            />
                        } />
                    <Separator />
                    <IntegrationSettingItem
                        id="tag"
                        label="Tag action item owners"
                        description="Mention assigned people in the post"
                        trailing={
                            <Switch
                                checked={draft.tagActionItemOwners}
                                onCheckedChange={(checked) =>
                                    patchSettings({ tagActionItemOwners: checked })
                                }
                            />
                        } />
                    <Separator />
                    <IntegrationSettingItem
                        id="dm"
                        label="Send DM to organizer"
                        description="Also send a private copy to the meeting host"
                        trailing={
                            <Switch
                                checked={draft.sendDmToOrganizer}
                                onCheckedChange={(checked) =>
                                    patchSettings({ sendDmToOrganizer: checked })
                                }
                            />
                        } />
                    <Separator />
                    <IntegrationSettingItem
                        id="transcript-link"
                        label="Include transcript link"
                        description="Add a link to the full transcript at the end"
                        trailing={
                            <Switch
                                checked={draft.includeTranscriptLink}
                                onCheckedChange={(checked) =>
                                    patchSettings({ includeTranscriptLink: checked })
                                }
                            />
                        } />
                </CardContent>
            </Card>
        </div>
    )
}
