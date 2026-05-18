import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { meetingApi, ApiErrorSchema } from "@workspace/api-client"
import type { MeetingAudioResponse } from "@workspace/types"
import { meetingKeys } from "../../_lib/meeting.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useMeetingAudioQuery(
  meetingId: string,
  enabled = true
): UseQueryResult<MeetingAudioResponse, Error> {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery({
    queryKey: meetingKeys.audio(workspaceId, meetingId),
    queryFn: () => meetingApi.getMeetingAudio(meetingId),
    enabled,
    staleTime: 8 * 60_000,
    retry: (failureCount, error) => {
      const parsed = ApiErrorSchema.safeParse(error)
      if (parsed.success && parsed.data.status === 404) return false
      return failureCount < 2
    },
  })
}
