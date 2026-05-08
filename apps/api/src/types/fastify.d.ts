import "fastify"
import type { preHandlerAsyncHookHandler } from "fastify"
import type { createAuth } from "@workspace/auth"
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
} from "@workspace/database"

type Auth = ReturnType<typeof createAuth>
type SessionData = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>

declare module "fastify" {
  interface FastifyInstance {
    auth: Auth
    verifySession: preHandlerAsyncHookHandler
    requireWorkspace: preHandlerAsyncHookHandler
    requireWorkspaceFromParams: preHandlerAsyncHookHandler
    requireRole: (
      roles: WorkspaceRole | WorkspaceRole[]
    ) => preHandlerAsyncHookHandler
    requireQuota: preHandlerAsyncHookHandler
  }
  interface FastifyRequest {
    user?: SessionData["user"]
    session?: SessionData["session"]
    workspace?: Workspace
    membership?: WorkspaceMember
  }
}
