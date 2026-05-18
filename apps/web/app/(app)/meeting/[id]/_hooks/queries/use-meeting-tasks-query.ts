import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { taskApi } from "@workspace/api-client"
import type { ActionItem } from "@workspace/types"
import { taskKeys } from "@/app/(app)/dashboard/tasks/_lib/task.keys"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

export function useMeetingTasksQuery(
  meetingId: string
): UseQueryResult<ActionItem[], Error> {
  const { workspaceId } = useCurrentWorkspace()

  return useQuery({
    queryKey: taskKeys.meeting(workspaceId, meetingId),
    queryFn: () => taskApi.fetchMeetingTasks(meetingId),
    staleTime: 20_000,
  })
}
