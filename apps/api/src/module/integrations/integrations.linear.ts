import type { LinearIntegrationConfig } from "@workspace/types"
import { LinearIntegrationConfigSchema } from "@workspace/types"

const LINEAR_API = "https://api.linear.app/graphql"

export function defaultLinearConfig(): LinearIntegrationConfig {
  return LinearIntegrationConfigSchema.parse({})
}

export async function exchangeLinearCode(code: string, redirectUri: string) {
  const clientId = process.env.LINEAR_CLIENT_ID
  const clientSecret = process.env.LINEAR_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("LINEAR_NOT_CONFIGURED")
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  })

  const res = await fetch("https://api.linear.app/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    throw new Error("LINEAR_OAUTH_FAILED")
  }

  const data = (await res.json()) as {
    access_token?: string
    refresh_token?: string
  }

  if (!data.access_token) {
    throw new Error("LINEAR_OAUTH_FAILED")
  }

  const viewer = await linearGraphql<{
    viewer: { id: string; name: string; organization: { id: string; name: string } }
  }>(
    data.access_token,
    `query { viewer { id name organization { id name } } }`
  )

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    externalAccountId: viewer.viewer.organization.id,
    externalAccountName: viewer.viewer.organization.name,
    defaultTeamId: null as string | null,
    defaultTeamName: null as string | null,
  }
}

async function linearGraphql<T>(accessToken: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(LINEAR_API, {
    method: "POST",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> }
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "LINEAR_API_ERROR")
  }
  if (!json.data) {
    throw new Error("LINEAR_API_ERROR")
  }
  return json.data
}

export async function listLinearTeams(accessToken: string) {
  const data = await linearGraphql<{
    teams: { nodes: Array<{ id: string; name: string; key: string }> }
  }>(
    accessToken,
    `query { teams { nodes { id name key } } }`
  )

  return data.teams.nodes.map((t) => ({
    id: t.id,
    name: `${t.key} / ${t.name}`,
  }))
}

const priorityMap = {
  urgent: 1,
  medium: 2,
  low: 3,
} as const

export async function createLinearIssuesFromTasks(input: {
  accessToken: string
  meetingTitle: string
  config: unknown
  tasks: Array<{ id: string; title: string }>
  /** When true, creates issues even if autoCreateIssues is disabled (manual sync). */
  manual?: boolean
}): Promise<{ created: number }> {
  const config = LinearIntegrationConfigSchema.parse(input.config)
  if (input.tasks.length === 0) {
    return { created: 0 }
  }
  if (!input.manual && !config.autoCreateIssues) {
    return { created: 0 }
  }

  let teamId = config.defaultTeamId
  if (!teamId) {
    const teams = await linearGraphql<{
      teams: { nodes: Array<{ id: string }> }
    }>(input.accessToken, `query { teams { nodes { id } } }`)
    teamId = teams.teams.nodes[0]?.id ?? null
  }

  if (!teamId) {
    throw new Error("LINEAR_NO_TEAM")
  }

  let created = 0

  for (const task of input.tasks) {
    const result = await linearGraphql<{
      issueCreate: { success: boolean }
    }>(
      input.accessToken,
      `mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
        }
      }`,
      {
        input: {
          teamId,
          title: task.title,
          description: `Created from meeting: ${input.meetingTitle}`,
          priority: priorityMap[config.defaultPriority],
        },
      }
    )

    if (result.issueCreate.success) {
      created += 1
    }
  }

  return { created }
}
