import { useQuery } from "@tanstack/react-query"
import { channelKeys } from "../../../_lib/channel-query-keys"
import { channelApi } from "@workspace/api-client"

export function useChannelQuery() {
  const { data: channels = [], isLoading } = useQuery({
    queryKey: channelKeys.all,
    queryFn: () => channelApi.getChannels(),
    staleTime: 300_000,
  })
  return {
    channels,
    isLoading,
  }
}
