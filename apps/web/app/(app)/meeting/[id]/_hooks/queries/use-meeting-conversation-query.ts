import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { meetingApi } from "@workspace/api-client"
import type { Conversation } from "@workspace/types"
import { meetingKeys } from "../../_lib/meeting.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useMeetingConversationQuery(
  meetingId: string
): UseQueryResult<Conversation, Error> {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery({
    queryKey: meetingKeys.conversation(workspaceId, meetingId),
    queryFn: () => meetingApi.getConversation(meetingId),
    staleTime: 60_000,
  })
}
