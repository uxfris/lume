"use client"

import { useQuery } from "@tanstack/react-query"
import { billingApi } from "@workspace/api-client"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useWorkspacePlan() {
  const { workspaceId } = useCurrentWorkspace()

  const query = useQuery({
    queryKey: ["billing", workspaceId],
    queryFn: () => billingApi.getBilling(),
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
  })

  const isStudioPro = query.data?.plan === "studio-pro"

  return {
    plan: query.data?.plan ?? "starter",
    usage: query.data ?? null,
    isStudioPro,
    isLoading: query.isLoading,
  }
}
