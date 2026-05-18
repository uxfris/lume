import type { Integration } from "@workspace/types"

/** Mirrors apps/api integrations catalog — static for marketing. */
export const MARKETING_INTEGRATION_CATALOG: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description:
      "Send meeting summaries and action items directly to project channels",
    category: "Team communication",
    logo: "/vectors/slack.svg",
    status: "disconnected",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Push decisions and action items into your sprint workflow",
    category: "Product & Engineering",
    logo: "/vectors/linear-app.svg",
    status: "disconnected",
  },
  {
    id: "asana",
    name: "Asana",
    description: "Turn action items into Asana tasks so nothing gets missed",
    category: "Work Management",
    logo: "/vectors/asana.svg",
    status: "coming soon",
  },
  {
    id: "clickup",
    name: "ClickUp",
    description:
      "Sync meeting follow-ups into the workspace your team already runs on",
    category: "Work Management",
    logo: "/vectors/clickup.svg",
    status: "coming soon",
  },
  {
    id: "jira",
    name: "Jira",
    description:
      "Turn action items into Jira tickets automatically so nothing gets lost",
    category: "Product & Engineering",
    logo: "/vectors/jira.svg",
    status: "coming soon",
  },
  {
    id: "github",
    name: "Github",
    description: "Turn engineering meeting notes into GitHub issues in seconds.",
    category: "Product & Engineering",
    logo: "/vectors/github.svg",
    status: "coming soon",
  },
  {
    id: "figma",
    name: "Figma",
    description: "Link design feedback from meetings directly to Figma files.",
    category: "Product & Engineering",
    logo: "/vectors/figma.svg",
    status: "coming soon",
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Save meeting notes and action items to Notion workspace automatically",
    category: "Knowledge Base",
    logo: "/vectors/notion.svg",
    status: "coming soon",
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Send meeting summaries straight to your team's knowledge base.",
    category: "Knowledge Base",
    logo: "/vectors/confluence.svg",
    status: "coming soon",
  },
  {
    id: "loom",
    name: "Loom",
    description: "Get automatic transcripts for every Loom video in your workspace.",
    category: "Knowledge Base",
    logo: "/vectors/loom.svg",
    status: "coming soon",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Log prospect and customer meetings to your CRM automatically.",
    category: "Revenue & Automation",
    logo: "/vectors/hubspot.svg",
    status: "coming soon",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect your notetaker to hundreds of apps with one integration.",
    category: "Revenue & Automation",
    logo: "/vectors/zapier.svg",
    status: "coming soon",
  },
]

export const LIVE_INTEGRATION_IDS = ["slack", "linear"] as const

export const availableIntegrations = MARKETING_INTEGRATION_CATALOG.filter((i) =>
  (LIVE_INTEGRATION_IDS as readonly string[]).includes(i.id)
)

export const comingSoonIntegrations = MARKETING_INTEGRATION_CATALOG.filter(
  (i) => i.status === "coming soon"
)
