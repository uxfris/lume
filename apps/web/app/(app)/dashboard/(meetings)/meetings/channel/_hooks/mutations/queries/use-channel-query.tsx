import { useQuery } from "@tanstack/react-query"
import { channelKeys } from "../../../_lib/channel.keys"
import { channelApi } from "@workspace/api-client"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useChannelQuery() {
  const { workspaceId } = useCurrentWorkspace()

  const { data: channels = [], isLoading } = useQuery({
    queryKey: channelKeys.all(workspaceId),
    queryFn: () => channelApi.getChannels(),
    staleTime: 300_000,
  })
  return {
    channels,
    isLoading,
  }
}
