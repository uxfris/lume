"use client"

import { CalendarMark, Document, UserCheckRounded } from "@solar-icons/react/ssr";
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IntegrationHero } from "../../_components/integration-hero";
import { IntegrationConnectCard } from "../../_components/integration-connect-card";
import { IntegrationFeatures } from "../../_components/integration-features";
import { IntegrationHeader } from "../../_components/integration-header";
import { IntegrationDisconnectCard } from "../../_components/integration-disconnect-card";
import { IntegrationLinearSettings } from "./integration-linear-settings";
import { IntegrationLinearStatCard } from "./integration-linear-stat-card";
import { IntegrationRecentActivityCard } from "../../_components/integration-recent-activity";
import {
    useIntegrationActivityQuery,
    useIntegrationDetailQuery,
} from "../../../_hooks/queries/use-integration-detail-query";
import { LinearIntegrationConfigSchema } from "@workspace/types";

const LINEAR_INTEGRATION_FEATURES = [
    {
        id: "auto-create",
        icon: Document,
        palette: "#EEEDFE",
        title: "Auto-create issues",
        description: "Turn meeting action items into Linear issues with AI-generated titles and descriptions",
    },
    {
        id: "auto-assign",
        icon: UserCheckRounded,
        palette: "#E6F1FB",
        title: "Auto-assign to members",
        description: "Team members mentioned during the meeting are automatically assigned to created issues",
    },
    {
        id: "auto-due",
        icon: CalendarMark,
        palette: "#E1F5EE",
        title: "Automatically set due dates",
        description: "Deadlines mentioned in the meeting are detected by AI and set as issue due dates",
    },
]

export function IntegrationLinearDetail() {
    const searchParams = useSearchParams()
    const detailQuery = useIntegrationDetailQuery("linear")
    const activityQuery = useIntegrationActivityQuery("linear")

    useEffect(() => {
        const oauth = searchParams.get("oauth")
        if (oauth === "success") {
            toast.success("Linear connected")
        } else if (oauth === "error") {
            toast.error(searchParams.get("error") ?? "Linear connection failed")
        }
    }, [searchParams])

    const detail = detailQuery.data
    const isConnected = detail?.status === "connected"
    const linearConfig = LinearIntegrationConfigSchema.parse(detail?.linearConfig ?? {})

    if (detailQuery.isLoading || !detail) {
        return (
            <div className="p-4 md:p-10">
                <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-10 space-y-5 overflow-y-scroll">
            <IntegrationHeader platform="Linear" />
            <div className="space-y-5 mx-auto max-w-[640px]">
                <IntegrationHero
                    icon="/vectors/linear-app.svg"
                    platform="Linear"
                    tagline={detail.description}
                    status={detail.status}
                />
                {!isConnected && (
                    <>
                        <IntegrationConnectCard
                            platform="Linear"
                            provider="linear"
                            description="Connect your Linear account to start automatically pushing issues from every meeting. You can choose the destination project and configure assignees after connecting." />
                        <IntegrationFeatures features={LINEAR_INTEGRATION_FEATURES} />
                    </>
                )}
                {isConnected && (
                    <>
                        <IntegrationDisconnectCard
                            label="Workspace:"
                            value={detail.connectedAccountLabel ?? "Connected"}
                            provider="linear"
                        />
                        {detail.stats && (
                            <IntegrationLinearStatCard
                                issuesCreated={detail.stats.issuesCreated}
                                autoAssigned={detail.stats.autoAssigned}
                                meetingsConnected={detail.stats.meetingsConnected}
                            />
                        )}
                        <IntegrationLinearSettings config={linearConfig} />
                        <IntegrationRecentActivityCard
                            activities={activityQuery.data?.activities ?? []}
                        />
                    </>
                )}
                <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
                    <span>By Linear Orbit, Inc.</span>
                    <span>OAuth 2.0</span>
                    <Link href="https://linear.app/developers/oauth-2-0-authentication" target="_blank" rel="noopener noreferrer">Documentation</Link>
                </div>
            </div>
        </div>
    )
}
