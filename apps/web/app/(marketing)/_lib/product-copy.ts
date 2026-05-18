export const PRODUCT_COPY = {
  hero: {
    eyebrow: "Product",
    headline: "Everything after the meeting ends — in one place.",
    subhead:
      "Capture the call, read the summary, ship the tasks. Search it all later.",
    ctaPrimary: "Start free",
    ctaSecondary: "View pricing",
  },
  liveSync: {
    label: "Live Sync",
    headline: "Paste a link. Lume joins the call.",
    body: "Add the assistant to Zoom, Google Meet, or Microsoft Teams while the meeting is live. Processing starts when the call ends.",
    placeholder: "Paste meeting URL (Zoom, Meet, or Teams)",
    note: "Same pipeline whether you join live or upload a file later.",
  },
  uploads: {
    label: "Uploads",
    headline: "Already recorded? Upload it.",
    body: "Drop an audio or video file when you didn't use Live Sync. You get the same transcript, summary, and action items.",
  },
  meetingDocument: {
    label: "Meeting document",
    headline: "A summary you'll actually read.",
    body: "Every meeting becomes a structured doc: overview, key takeaways, and a speaker-aware transcript — built for skimming, not scrolling walls of text.",
    callouts: [
      { label: "Overview", copy: "The gist in one pass" },
      { label: "Key takeaways", copy: "Bullets you can copy to Slack" },
      { label: "Transcript", copy: "Jump to who said what" },
    ],
  },
  actionItems: {
    label: "Action items",
    headline: "Follow-ups with owners, not forgotten bullets.",
    body: "Lume extracts tasks from the conversation. Review, edit, and sync to Linear — with meeting context attached.",
    link: "See integrations",
  },
  search: {
    label: "Search",
    headline: "Find what was decided last month.",
    body: 'Search by keyword or meaning across meetings in your workspace. Stop asking "what did we agree on?"',
  },
  workspaces: {
    label: "Workspaces",
    headline: "One home for your team's meetings.",
    body: "Organize with channels, star important calls, and share meetings with teammates. Studio Pro adds shared workspaces for growing teams.",
  },
  security: {
    headline: "Your calls are sensitive. We treat them that way.",
    body: "Encryption in transit and at rest, workspace access controls, and clear policies on AI processing.",
    link: "How we secure your data",
  },
  finalCta: {
    headline: "See it on your next call.",
    cta: "Start free",
    ctaSecondary: "View pricing",
  },
} as const
