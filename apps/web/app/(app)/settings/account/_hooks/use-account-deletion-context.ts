import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { accountApi } from "@workspace/api-client"

export const accountDeletionKeys = {
  context: ["account", "deletion-context"] as const,
}

type AccountDeletionContext = Awaited<
  ReturnType<typeof accountApi.getDeletionContext>
>

export function useAccountDeletionContext(
  enabled: boolean
): UseQueryResult<AccountDeletionContext> {
  return useQuery({
    queryKey: ["account", "deletion-context"],
    queryFn: () => accountApi.getDeletionContext(),
    enabled,
    staleTime: 0,
  })
}
