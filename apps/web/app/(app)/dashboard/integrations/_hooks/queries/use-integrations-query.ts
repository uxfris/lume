import { useQuery } from "@tanstack/react-query"
import { integrationsApi } from "@workspace/api-client"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { integrationsKeys } from "../../_lib/integrations.keys"

export function useIntegrationsQuery() {
  const { workspaceId } = useCurrentWorkspace()
  return useQuery({
    queryKey: integrationsKeys.list(workspaceId),
    queryFn: () => integrationsApi.list(),
    staleTime: 60_000,
  })
}
