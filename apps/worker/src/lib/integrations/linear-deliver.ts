import { LinearIntegrationConfigSchema } from "@workspace/types"

const LINEAR_API = "https://api.linear.app/graphql"

async function linearGraphql<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
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
}): Promise<{ created: number; assigned: number }> {
  const config = LinearIntegrationConfigSchema.parse(input.config)
  if (!config.autoCreateIssues || input.tasks.length === 0) {
    return { created: 0, assigned: 0 }
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
  let assigned = 0

  for (const task of input.tasks) {
    const result = await linearGraphql<{
      issueCreate: { success: boolean; issue?: { id: string; title: string } }
    }>(
      input.accessToken,
      `mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue { id title }
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

  return { created, assigned }
}
