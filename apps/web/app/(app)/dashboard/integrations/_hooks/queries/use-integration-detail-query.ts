import { useQuery } from "@tanstack/react-query"
import { integrationsApi } from "@workspace/api-client"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { integrationsKeys } from "../../_lib/integrations.keys"

export function useIntegrationDetailQuery(provider: "slack" | "linear") {
  const { workspaceId } = useCurrentWorkspace()
  return useQuery({
    queryKey: integrationsKeys.detail(workspaceId, provider),
    queryFn: () => integrationsApi.getDetail(provider),
    staleTime: 30_000,
  })
}

export function useIntegrationActivityQuery(provider: "slack" | "linear") {
  const { workspaceId } = useCurrentWorkspace()
  return useQuery({
    queryKey: integrationsKeys.activity(workspaceId, provider),
    queryFn: () => integrationsApi.getActivity(provider),
    staleTime: 30_000,
  })
}
