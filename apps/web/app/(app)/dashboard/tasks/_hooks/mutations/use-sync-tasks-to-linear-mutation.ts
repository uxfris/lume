"use client"

import { useMutation } from "@tanstack/react-query"
import { taskApi } from "@workspace/api-client"
import type { SyncTasksToLinearBody } from "@workspace/types"

export function useSyncTasksToLinearMutation() {
  return useMutation({
    mutationFn: (body: SyncTasksToLinearBody) => taskApi.syncToLinear(body),
  })
}
