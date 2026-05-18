import { IntegrationsView } from "./_components/integrations-view";
import { IntegrationToolbar } from "./_components/integration-toolbar/integration-toolbar";
import { getServerApiFetchOptions } from "@/lib/server-api";
import { integrationsApi } from "@workspace/api-client";

export default async function Integrations() {
    const { cookie, workspaceId } = await getServerApiFetchOptions()
    const { integrations } = await integrationsApi.list({ cookie, workspaceId })

    return (
        <div className="flex-1 flex flex-col overflow-hidden pt-4 md:pt-10">
            <div className="space-y-6">
                <h1 className="hidden md:block text-base font-semibold px-4 md:px-10">
                    Integrations
                </h1>
                <IntegrationToolbar />
            </div>
            <IntegrationsView integrations={integrations} />
        </div>
    )
}
