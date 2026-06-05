export const HOME_COPY = {
  hero: {
    eyebrow: "Meeting intelligence",
    headline: "Never re-watch a meeting to remember what was decided.",
    subhead:
      "Lume joins your Zoom, Google Meet, or Teams call, then delivers a transcript, summary, and action items you can search — and sync to Linear or Slack.",
    ctaPrimary: "Start free",
    ctaSecondary: "See how it works",
    reassurance: "No credit card · 5 free meetings/month",
  },
  logoBar: {
    label: "Works with the calls you already have",
    platforms: [
      { name: "Zoom", icon: "/vectors/zoomus.svg" },
      { name: "Google Meet", icon: "/vectors/google.svg" },
      { name: "Microsoft Teams", icon: "/vectors/microsoft.svg" },
    ],
  },
  whySwitch: {
    label: "Why teams switch",
    headline: "Legacy notetakers are slow, expensive, and hard to trust.",
    body: "Per-seat pricing adds up fast. Cluttered UIs slow you down. Lume is built for small teams: a clean meeting document, honest free tier, and flat Pro pricing.",
    outcomes: [
      "Decisions captured automatically",
      "Tasks that reach Linear, not a forgotten doc",
      "Search across every meeting in your workspace",
    ],
  },
  howItWorks: {
    label: "How it works",
    headline: "Three steps. No manual notes.",
    steps: [
      {
        title: "Join",
        body: "Paste a meeting link or upload a recording. Lume captures the conversation.",
      },
      {
        title: "Understand",
        body: "Get a transcript, summary, and key takeaways — speaker-aware.",
      },
      {
        title: "Act",
        body: "Review action items, search past meetings, sync to your tools.",
      },
    ],
  },
  capabilities: {
    label: "What you get",
    headline: "Everything after the meeting ends.",
    items: [
      {
        title: "Live Sync",
        body: "Add Lume to an active Zoom, Meet, or Teams call.",
      },
      {
        title: "Transcripts",
        body: "Full transcript with speakers, ready to skim or quote.",
      },
      {
        title: "AI summaries",
        body: "Overview and key takeaways without rewatching.",
      },
      {
        title: "Action items",
        body: "Follow-ups with owners — push to Linear in a click.",
      },
      {
        title: "Search",
        body: "Find what was said across your workspace.",
      },
      {
        title: "Workspaces",
        body: "One library for your team's meetings.",
      },
    ],
  },
  preview: {
    label: "Inside Lume",
    headline: "One document per meeting.",
    caption:
      "Overview, takeaways, transcript, and tasks — in a UI you'll actually open again.",
  },
  integrations: {
    label: "Integrations",
    headline: "Send outcomes where work happens.",
    body: "Summaries to Slack. Tasks to Linear. More tools on the way.",
    link: "View all integrations",
    tools: [
      {
        name: "Slack",
        icon: "/vectors/slack.svg",
        description: "Meeting summaries and action items in channels",
      },
      {
        name: "Linear",
        icon: "/vectors/linear-app.svg",
        description: "Decisions and tasks in your sprint workflow",
      },
    ],
  },
  pricing: {
    label: "Pricing",
    headline: "Start free. Upgrade when meetings are daily.",
    link: "Compare plans",
    starter: {
      name: "Starter",
      price: "$0",
      detail: "5 meetings/month, AI summaries & search",
    },
    pro: {
      name: "Studio Pro",
      price: "$25/mo",
      detail: "Unlimited meetings, shared workspaces",
    },
  },
  socialProof: {
    line: "Built for startup teams who live in meetings",
  },
  faq: {
    label: "FAQ",
    headline: "Common questions",
    items: [
      {
        question: "Which meeting platforms do you support?",
        answer:
          "Zoom, Google Meet, and Microsoft Teams via Live Sync. You can also upload recordings.",
      },
      {
        question: "Does Lume join as a visible participant?",
        answer:
          "Yes. The assistant joins like a guest so participants know it's recording.",
      },
      {
        question: "What's included on the free plan?",
        answer:
          "Starter includes 5 meetings per month, AI summaries, search, and a single workspace. See Pricing for storage details.",
      },
      {
        question: "Is my data used to train AI models?",
        answer:
          "We use third-party AI for transcription and analysis. See our Privacy Policy for what we send and how we handle your data.",
      },
      {
        question: "How is Lume different from Fireflies?",
        answer:
          "Lume focuses on a modern experience and pricing that works for small teams — flat Pro pricing, not per-seat surprises.",
      },
    ],
  },
  finalCta: {
    headline: "Try your next meeting with Lume.",
    subhead: "Paste a link after signup. First summary in minutes.",
    cta: "Start free",
    reassurance: "No credit card required",
  },
} as const
