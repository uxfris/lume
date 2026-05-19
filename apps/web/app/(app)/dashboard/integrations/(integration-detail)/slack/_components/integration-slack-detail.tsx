"use client"

import { Notes, SquareShareLine, Tag } from "@solar-icons/react/ssr";
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IntegrationHero } from "../../_components/integration-hero";
import { IntegrationConnectCard } from "../../_components/integration-connect-card";
import { IntegrationFeatures } from "../../_components/integration-features";
import { IntegrationHeader } from "../../_components/integration-header";
import { IntegrationDisconnectCard } from "../../_components/integration-disconnect-card";
import { IntegrationSlackIssueCard } from "./integration-slack-issue-card";
import { IntegrationSlackSettings } from "./integration-slack-settings";
import { IntegrationSlackPreview } from "./integration-slack-preview";
import { IntegrationRecentActivityCard } from "../../_components/integration-recent-activity";
import { IntegrationDetailSkeleton } from "../../_components/integration-detail-skeleton";
import {
    useIntegrationActivityQuery,
    useIntegrationDetailQuery,
} from "../../../_hooks/queries/use-integration-detail-query";
import { integrationsApi } from "@workspace/api-client";
import { SlackIntegrationConfigSchema } from "@workspace/types";

const SLACK_INTEGRATION_FEATURES = [
    {
        id: "auto-post",
        icon: Notes,
        palette: "#E6F1FB",
        title: "Auto-post summaries to a channel",
        description: "Every meeting summary is posted automatically to the channel you choose when the call ends.",
    },
    {
        id: "tag",
        icon: Tag,
        palette: "#EAF3DE",
        title: "Tag action item owners",
        description: "Action items are posted with @mentions so the right people are notified immediately.",
    },
    {
        id: "send",
        icon: SquareShareLine,
        palette: "#EEEDFE",
        title: "Send a DM to the organizer",
        description: "Optionally deliver a private copy of the summary to the person who called the meeting.",
    },
]

export function IntegrationSlackDetail() {
    const searchParams = useSearchParams()
    const detailQuery = useIntegrationDetailQuery("slack")
    const activityQuery = useIntegrationActivityQuery("slack")

    useEffect(() => {
        const oauth = searchParams.get("oauth")
        if (oauth === "success") {
            toast.success("Slack connected")
        } else if (oauth === "error") {
            toast.error(searchParams.get("error") ?? "Slack connection failed")
        }
    }, [searchParams])

    const detail = detailQuery.data
    const isConnected = detail?.status === "connected"
    const slackConfig = SlackIntegrationConfigSchema.parse(detail?.slackConfig ?? {})

    async function handleFixPermission() {
        try {
            const { url } = await integrationsApi.getOAuthUrl("slack")
            window.location.href = url
        } catch {
            toast.error("Could not start re-authorization")
        }
    }

    if (detailQuery.isLoading || !detail) {
        return <IntegrationDetailSkeleton showPreview />
    }

    return (
        <div className="p-4 md:p-10 space-y-5 overflow-y-scroll">
            <IntegrationHeader platform="Slack" />
            <div className="space-y-5 mx-auto max-w-[640px]">
                <IntegrationHero
                    icon="/vectors/slack.svg"
                    platform="Slack"
                    tagline={detail.description}
                    status={detail.status}
                />
                {!isConnected && (
                    <>
                        <IntegrationConnectCard
                            platform="Slack"
                            provider="slack"
                            description="Connect your Slack workspace to automatically post summaries, action items, and decisions — no more copy-pasting notes after every meeting." />
                        <IntegrationFeatures features={SLACK_INTEGRATION_FEATURES} />
                        <IntegrationSlackPreview />
                    </>
                )}
                {isConnected && (
                    <>
                        <IntegrationDisconnectCard
                            label="Connected as"
                            value={detail.connectedAccountLabel ?? "Workspace"}
                            provider="slack"
                        />
                        {!slackConfig.channelAccessOk && slackConfig.defaultChannelName && (
                            <IntegrationSlackIssueCard
                                channelName={slackConfig.defaultChannelName}
                                onFixPermission={handleFixPermission}
                                onChangeChannel={() => {}}
                            />
                        )}
                        <IntegrationSlackSettings config={slackConfig} />
                        <IntegrationRecentActivityCard
                            activities={activityQuery.data?.activities ?? []}
                        />
                    </>
                )}
                <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
                    <span>By Slack Technologies</span>
                    <span>OAuth 2.0</span>
                    <Link href="https://slack.com/integrations" target="_blank" rel="noopener noreferrer">Documentation</Link>
                </div>
            </div>
        </div>
    )
}
