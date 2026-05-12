const DASHBOARD = "/dashboard"
const SETTINGS = "/settings"

export const routes = {
  term: "/term",
  privacy: "/privacy",

  authentication: "/authentication",

  dashboard: {
    root: DASHBOARD,

    meetings: {
      root: `${DASHBOARD}/meetings`,

      channel: (id: string) => `${DASHBOARD}/meetings/channel/${id}`,

      starred: `${DASHBOARD}/starred`,

      createdByMe: `${DASHBOARD}/created-by-me`,

      sharedWithMe: `${DASHBOARD}/shared-with-me`,
    },

    integrations: {
      root: `${DASHBOARD}/integrations`,

      detail: (id: string) => `${DASHBOARD}/integrations/${id}`,
    },

    tasks: `${DASHBOARD}/tasks`,

    uploads: `${DASHBOARD}/uploads`,
  },

  meeting: (id: string) => `/meeting/${id}`,

  settings: {
    root: SETTINGS,

    account: `${SETTINGS}/account`,

    billing: `${SETTINGS}/billing`,

    people: `${SETTINGS}/people`,

    workspace: `${SETTINGS}/workspace`,
  },
}
