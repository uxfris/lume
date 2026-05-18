import {
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { workspaceApi } from "@workspace/api-client"
import type { WorkspaceMembership } from "@workspace/types"
import { workspaceKeys } from "../../_lib/workspace.keys"

type CreateWorkspacePayload = {
  name: string
}

type CreateWorkspaceReturn = WorkspaceMembership

type UseCreateWorkspaceMutationReturn = {
  create: UseMutateFunction<
    WorkspaceMembership, // return type
    unknown, // error type
    CreateWorkspacePayload, // variables
    unknown // context
  >
  isPending: boolean
  error: unknown
}

export function useCreateWorkspaceMutation(): UseCreateWorkspaceMutationReturn {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    CreateWorkspaceReturn,
    unknown,
    CreateWorkspacePayload
  >({
    mutationFn: async ({ name }) => {
      const created = await workspaceApi.create(name)

      return {
        ...created,
        image: created.image ?? null,
        role: "OWNER",
        joinedAt: new Date().toISOString(),
      }
    },

    onSuccess: (workspace) => {
      queryClient.setQueryData(workspaceKeys.me(), (old: any) => {
        if (!old) return old

        return {
          ...old,
          workspaces: [workspace, ...old.workspaces],
        }
      })
    },
  })

  return {
    create: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
