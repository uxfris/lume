# Lume

Meeting intelligence for small teams — capture calls, understand what was decided, and find it again later.

---

# Overview

Lume helps teams stop losing context after meetings end.

Most teams do not struggle with *having* meetings. They struggle with what happens *after*: decisions buried in hour-long recordings, action items scattered across Slack, and follow-up calls scheduled just to remember what was already agreed. Lume records or accepts uploads from Zoom, Google Meet, and Microsoft Teams, then turns conversations into **speaker-aware transcripts**, **skimmable summaries**, **action items**, and **searchable workspace knowledge**.

The product is built for **small teams, startups, and indie builders** who want Fireflies-style capabilities without enterprise per-seat pricing or a UI that feels stuck in 2018. Starter is free (5 meetings/month, no credit card). Studio Pro is a flat **$25/month per workspace** — not per user.

The core journey is simple: **Capture → Understand → Act → Recall.**

---

# Inspiration & Motivation

I built Lume after watching the same pattern repeat on every team I worked with: someone would say *"I think we decided that in a call two weeks ago,"* and nobody could find the answer without re-watching a recording or scheduling another meeting.

Tools like Fireflies.ai solve the transcription problem, but two frustrations kept coming up:

1. **The product felt heavy.** Dense transcript dumps, clunky navigation, and UI that made skimming harder than reading a long email thread.
2. **Pricing did not fit small teams.** Sharp jumps from a thin free tier to per-seat plans left startups paying for seats they did not need — or skipping meeting intelligence entirely.

I wanted to build something that felt like the tools I actually enjoy using daily (Linear, Vercel — fast, calm, opinionated about layout) while keeping the **full pipeline** in one place: record, transcribe, summarize, extract tasks, search. Not a demo with twenty integration logos and three working features — a product where each screen earns its place.

This is a **solo portfolio project** (~14 weeks, 30+ hours/week) designed to be reviewed as real software: multi-tenant, billed, deployed, and operated — not a weekend CRUD tutorial.

---

# Key Features

### Live Sync

**What:** Paste a live Zoom, Google Meet, or Teams URL. A Recall.ai bot joins the call, records it, and kicks off processing when the meeting ends.

**Why:** Most capture happens *during* the call, not after someone remembers to export a file. This removes friction from the moment teams already have a meeting link open.

**Pain point:** "We forgot to record" or "nobody uploaded the Zoom file."

---

### Uploads

**What:** Drop audio or video files (Loom exports, local recordings, etc.) into the same transcript → summary → tasks pipeline.

**Why:** Not every meeting goes through a bot — consultants, async recordings, and offline captures still need the same intelligence.

**Pain point:** Different tools for live vs. uploaded meetings, or manual transcription workflows.

---

### Meeting documents

**What:** Each meeting becomes a structured document: overview, key takeaways, and a speaker-labeled transcript. Content is editable in a TipTap editor so AI output is a starting point, not a locked PDF.

**Why:** Transcripts alone are not useful — people need **skimmable structure** and the ability to fix mistakes (names, jargon, decisions).

**Pain point:** Wall-of-text transcripts nobody reads.

---

### Action items & task view

**What:** Tasks extracted from conversations with assignees, aggregated across meetings, editable before they become "official."

**Why:** Meetings create commitments; those commitments should not live only inside a summary paragraph.

**Pain point:** "Who was supposed to do that?" two weeks later.

---

### Linear & Slack integrations

**What:** Push action items to Linear with meeting context; deliver summaries to Slack after processing completes.

**Why:** Teams already work in issue trackers and chat — meeting intelligence should **meet them there**, not become another silo.

**Pain point:** Copy-pasting bullets from a notetaker into Jira/Linear/Slack by hand.

---

### Hybrid search (⌘K / Ctrl+K)

**What:** Command palette search across the workspace using **keyword** matching (`pg_trgm`) and **semantic** search (`pgvector` + OpenAI embeddings).

**Why:** People search by exact project names *and* by intent ("what did we decide about pricing?") — one method alone fails too often.

**Pain point:** Institutional memory trapped in unsearchable recordings.

---

### Workspaces & collaboration

**What:** Multi-tenant workspaces with roles (owner, admin, member, guest), invites, invite links, channels, starred meetings, and sharing controls (restricted, workspace-wide, link-based).

**Why:** Meeting data is sensitive and team-scoped from day one — not bolted on after a single-user MVP.

**Pain point:** Personal notetakers that break when a second teammate joins.

---

### Billing & quotas

**What:** Starter (free, 5 meetings/month) and Studio Pro (unlimited meetings, shared workspaces) via Stripe Checkout. API-enforced quotas on uploads and bot creation — not UI-only limits.

**Why:** Sustainable product economics and honest free-tier messaging on the marketing site.

**Pain point:** Surprise paywalls or "unlimited" claims that break under real usage.

---

# User Experience Thinking

Lume is **dark-mode friendly** and visually aligned with modern SaaS products: restrained typography, card-based layouts, and a meeting detail page capped around ~700px width so reading feels like a document, not a dashboard cram.

**Onboarding** flows through OAuth (Google, Microsoft) or email via Better Auth, then into a personal workspace. Marketing copy matches shipped behavior — no vaporware sections — so first-time users are not sold features that do not exist yet.

**Processing feedback** matters because transcription and AI analysis take minutes, not milliseconds. Upload and meeting pages subscribe to **Server-Sent Events** (`EventSource`) for live pipeline status, with polling fallback. Users see progress instead of a frozen screen wondering if something broke.

**The meeting document** is the hero surface: toolbar actions (star, share, export patterns), playback aligned with transcript navigation where media exists, and slash commands in the editor for power users without hiding basics.

**Discoverability:** A command palette for global search, sidebar navigation for meetings/tasks/integrations, filters and channels on the meetings library, and keyboard shortcut infrastructure (`ShortcutProvider`) for actions like bulk delete.

**Accessibility (in progress, intentional):** Radix/shadcn primitives, `aria-label` on icon-only controls, semantic table markers on pricing comparisons, and theme switching (light/dark/system). Full WCAG audit is on the roadmap — the component layer was chosen to make that path feasible.

**Responsiveness:** Mobile sidebar patterns, responsive marketing sections, and touch-friendly dialogs. The primary workflow targets desktop (where meetings happen), but settings and reading hold up on smaller screens.

---

# Technical Architecture

Lume is a **pnpm + Turborepo monorepo** with four runtime surfaces that scale independently — not a single Next.js app doing everything.

```mermaid
flowchart TB
  subgraph clients
    Web["apps/web — Next.js 16"]
  end

  subgraph backend
    API["apps/api — Fastify 5"]
    Worker["apps/worker — BullMQ"]
  end

  subgraph data
    PG[("PostgreSQL 16 + pgvector")]
    Redis[("Redis")]
    S3[("AWS S3")]
  end

  subgraph ml
    Whisper["services/whisper — faster-whisper + pyannote"]
    OpenAI["OpenAI API"]
    Recall["Recall.ai"]
  end

  Web -->|REST + cookies| API
  API -->|enqueue| Redis
  Worker -->|consume| Redis
  API --> PG
  Worker --> PG
  API --> S3
  Worker --> S3
  Worker --> Whisper
  Worker --> OpenAI
  API --> Recall
  Worker --> Recall
```

### Why this shape?

| Choice | Reason |
|--------|--------|
| **Fastify API separate from Next.js** | Meeting pipelines run minutes, not milliseconds. Webhooks (Stripe, Recall) and SSE must not hit serverless timeouts. API deploys independently from marketing pages. |
| **Dedicated BullMQ worker** | Golden rule: the API never does work over ~200ms. Whisper, diarization, and LLM calls stay off the request path with per-stage retries. |
| **PostgreSQL + pgvector + pg_trgm** | One database for relational data *and* hybrid search — no Elasticsearch cluster for a solo-maintained MVP. |
| **S3 presigned uploads** | Large audio never streams through Node; browser uploads directly; workers fetch via presigned GET. |
| **Self-hosted Whisper + pyannote** | Predictable unit economics vs. per-minute STT APIs; same pipeline for uploads. |
| **Recall.ai for bots** | Building Zoom/Meet/Teams bots is a product on its own — integration buys time to focus on UX and pipeline quality. |
| **Dual ingestion paths** | Bot meetings can import Recall's transcript and skip GPU transcription; uploads still run the full quality pipeline. |

### Request flows

**Upload path:**

```mermaid
sequenceDiagram
  participant User
  participant Web
  participant API
  participant S3
  participant Worker
  participant Whisper
  participant OpenAI
  participant DB

  User->>Web: Drop file
  Web->>API: POST /uploads/presign
  API->>S3: Presigned PUT URL
  Web->>S3: Direct upload
  Web->>API: POST /uploads/:id/complete
  API->>DB: Create Meeting
  API->>Worker: transcribe → diarize → analyze → embed
  Worker->>Whisper: STT + diarization
  Worker->>OpenAI: Summary + action items
  Worker->>DB: Chunks + embeddings
  Worker-->>Web: SSE progress via Redis pub/sub
```

**Live Sync path:** Paste URL → API creates meeting → Recall bot joins → webhook on recording/transcript done → S3 or `import-bot-transcript` → `analyze` → `embed` → `deliver-integrations`.

### Stack summary

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TanStack Query, TipTap |
| API | Fastify 5, Zod, Better Auth, OpenAPI/Swagger |
| Worker | BullMQ, Node.js, ffmpeg |
| Database | PostgreSQL 16, Prisma, pgvector, pg_trgm |
| AI/ML | faster-whisper, pyannote, OpenAI (analysis + embeddings) |
| Integrations | Recall.ai, Stripe, Resend, Slack, Linear, Twilio (2FA SMS) |
| Infra | Docker Compose (local), Vercel (web), Railway (API, worker, GPU Whisper), AWS S3 |

### Authentication & multi-tenancy

**Better Auth** on the API origin handles Google/Microsoft OAuth (with calendar scopes for Recall sync), email/password, sessions, and optional SMS 2FA. The web app sends `x-workspace-id` on workspace-scoped calls; repos **always** filter by `workspaceId` even when middleware ran — belt and suspenders for tenant isolation.

### Deployment

| Service | Platform |
|---------|----------|
| `apps/web` | Vercel |
| `apps/api`, `apps/worker` | Railway |
| `services/whisper` | Railway GPU or Hetzner |
| Postgres | Neon or Railway |
| Redis | Upstash or Railway |
| Blobs | AWS S3 |

Observability: structured logs (pino), Prometheus `/metrics`, Sentry with `GIT_SHA`, and CI schema-drift gates so migrations never diverge from Prisma silently.

---

# Development Process

I treated this like a product build, not a feature checklist.

**Planning first.** `docs/project-brief.md` locked problem, audience, and pricing before code. `docs/backend-plan.md` broke the backend into **phased, demoable milestones** (~14 weeks) — each phase had something you could click through, not a big-bang integration at the end.

**MVP discipline.** Early scope was capture + transcript + summary. Integrations (Slack, Linear), calendar sync, billing, and search came after the core pipeline worked end-to-end. The marketing site was written to match **shipped** capabilities (`landing/micro-copy-mvp.md`, `product-copy.ts`) so I was not selling a roadmap as a product.

**Monorepo as a velocity tool.** Shared Zod types (`@workspace/types`), Prisma client (`@workspace/database`), queue contracts (`@workspace/queue`), and UI primitives (`@workspace/ui`) meant web and API stayed aligned — critical for one person wearing every hat.

**Architecture decisions in writing.** Twenty-four ADRs in `docs/architecture-decisions.md` document what was rejected (Next.js-only backend, mega-jobs, Elasticsearch day one) and what trade-offs were accepted. When I forgot *why* something existed, I had a paper trail.

**Debugging async systems.** Long pipelines forced a different mindset: `ProcessingEvent` rows, Bull Board, queue-depth metrics, runbooks for worker stuck / OpenAI outage / Whisper OOM. I learned to debug **state machines**, not single HTTP responses.

**Refactoring when pain appeared.** Examples: splitting one pipeline into staged queues; adding Redis pub/sub for SSE; tightening auth rate limits after session polling hit global limits; CI `schema-drift` after Prisma schema and migrations briefly diverged during rapid iteration.

---

# Challenges & Solutions

### 1. Long-running work vs. fast HTTP

**Problem:** Transcription and LLM analysis can take 1–10+ minutes per meeting. Blocking the API would freeze uploads and destroy UX under load.

**Why it was hard:** Every tutorial shows `await` in a route handler. Real pipelines need retries, partial failure, and progress UI.

**Approach:** API enqueues BullMQ jobs and returns immediately. Worker owns `transcribe` → `diarize` → `analyze` → `embed` as separate queues with conservative retry defaults for expensive steps.

**Outcome:** Upload endpoints stay sub-200ms. Failures mark `Meeting.status = FAILED` with auditable `ProcessingEvent` history instead of hanging requests.

---

### 2. Two ingestion paths, one product experience

**Problem:** Recall can deliver a diarized transcript; re-running Whisper + pyannote wastes GPU time and minutes. Uploads still need our own STT path.

**Why it was hard:** One code path is simpler; two paths mean format normalization, duplicate webhook handling, and twice the test matrix.

**Approach:** `import-bot-transcript` queue skips to `analyze`; uploads run full pipeline. Deterministic `jobId` on webhooks for idempotency.

**Outcome:** Live Sync feels fast and affordable; uploads retain quality control under our stack.

---

### 3. Schema drift during rapid DB iteration

**Problem:** Migrations created tables before every model lived in `schema.prisma` — the Prisma client could silently diverge from production.

**Why it was hard:** Easy to fix locally, catastrophic on deploy. Solo devs skip migration discipline when moving fast.

**Approach:** GitHub Actions `schema-drift` job: `migrate deploy` then `prisma migrate diff --exit-code`. Every schema change ships with its migration in the same PR.

**Outcome:** CI blocks the exact failure mode that would have broken Railway deploys.

---

### 4. Live progress without WebSockets

**Problem:** Users stare at a spinner for minutes during processing.

**Why it was hard:** WebSockets add infra complexity; polling is noisy; serverless timeouts fight long connections.

**Approach:** Worker publishes to Redis channel `meeting:<id>`; API exposes SSE `GET /meetings/:id/events`; web uses `EventSource` with polling fallback.

**Outcome:** Progress feels realtime without sticky sessions or a socket cluster.

---

### 5. Whisper memory limits

**Problem:** Larger Whisper models OOM on modest GPU/RAM — jobs fail mysteriously after long runs.

**Why it was hard:** Failure happens deep in Python, not in TypeScript stack traces users expect.

**Approach:** Documented runbook (`docs/runbooks/whisper-oom.md`), model size env tuning, and marking meetings failed instead of blind BullMQ retries that re-burn GPU dollars.

**Outcome:** Operational playbook exists; failures are visible in the product, not silent queue loops.

---

### 6. Auth rate limits vs. session polling

**Problem:** Stricter `/api/auth/*` rate limits protected against abuse but broke legitimate session refresh patterns.

**Why it was hard:** Security defaults and SPA ergonomics pull in opposite directions.

**Approach:** Tuned limits per environment (higher in dev, adjusted prod thresholds after observing real traffic).

**Outcome:** Safer auth surface without locking users out during normal use.

---

# What I Learned

**Technical:** Async products are state machines. The interesting bugs live between queues — orphaned meetings, duplicate webhook enqueues, embedding dimension mismatches — not in React components. Splitting deployables (Vercel + Railway + GPU service) is more work upfront but matches how the system actually fails and scales.

**Product:** Scope is a feature. Shipping Slack + Linear *well* beat showing twenty logos. Pricing should match the audience: flat workspace pricing is a product decision as much as a business one. Marketing copy that lies erodes trust faster than missing features.

**UX:** Minutes-long pipelines need **honest progress**. Users forgive latency when the system communicates; they churn on a spinner with no narrative.

**Operations:** Portfolio projects become credible when you add health checks, metrics, Sentry, runbooks, and CI gates — the unglamorous layer that says "I thought about 3am."

**Mindset:** I am more comfortable now deciding *what not to build* and writing down *why* before the code fossilizes. ADRs felt like overhead until I needed them three weeks later.

---

# Future Improvements

Prioritized by impact and realism for a solo maintainer:

| Area | Direction |
|------|-----------|
| **Search at scale** | Tune ivfflat indexes; revisit ranking (RRF) when chunk count grows |
| **Whisper economics** | Measure cost per meeting; compare self-hosted GPU vs. OpenAI Whisper API at real volume |
| **Accessibility** | Formal WCAG pass, keyboard audit on meeting editor, focus management in dialogs |
| **Offline / mobile** | Read-only meeting documents on mobile web; native app only if usage proves it |
| **AI quality** | User feedback loop on summaries; optional re-run analysis with edited transcript |
| **Analytics** | Funnel from signup → first meeting → upgrade; processing success rates by source |
| **Testing** | Integration test harness in CI (upload → mock Whisper → analyze) — listed in backend plan Phase 12 |
| **Security** | Promote CSP from Report-Only to enforcing; webhook dead-letter queue for Recall |
| **Integrations** | Deeper calendar automation; more delivery targets — only where users pull, not logo collecting |

---

# Screenshots / UI Showcase

_Add screenshots to `docs/` and uncomment paths below for GitHub rendering._

### Marketing & onboarding

![Home — hero and value proposition](./docs/portfolio/home.png)

![Pricing — Starter vs Studio Pro](./docs/portfolio/pricing.png)

### Capture

![Live Sync — paste meeting URL](./docs/portfolio/live-sync.png)

![Uploads — drag and drop with processing status](./docs/portfolio/uploads.png)

### Meeting document

![Meeting detail — overview, takeaways, transcript](./docs/portfolio/meeting-document.png)

![TipTap editor — editable AI summary](./docs/portfolio/meeting-editor.png)

### Act & recall

![Tasks — action items across meetings](./docs/portfolio/tasks.png)

![Command palette search — ⌘K](./docs/portfolio/search.png)

### Team & settings

![Workspace — channels and meetings library](./docs/portfolio/dashboard.png)

![Integrations — Slack and Linear](./docs/portfolio/integrations.png)

![Settings — billing and workspace members](./docs/portfolio/settings.png)

---

# Project Structure

```text
lume/
├── apps/
│   ├── web/              # Next.js — marketing site + authenticated app
│   ├── api/              # Fastify — REST, webhooks, auth, SSE, OpenAPI
│   └── worker/           # BullMQ — transcription, analysis, embeddings, delivery
├── packages/
│   ├── database/         # Prisma schema, migrations, client
│   ├── queue/            # Queue names and typed job payloads
│   ├── types/            # Shared Zod schemas (web + API contract)
│   ├── api-client/       # Typed fetch client for the web app
│   ├── auth/             # Better Auth configuration
│   ├── ui/               # Shared shadcn/ui components
│   ├── account-deletion/ # GDPR-style deletion orchestration
│   └── eslint-config, typescript-config, …
├── services/
│   └── whisper/          # FastAPI — faster-whisper + pyannote
├── docs/                 # ADRs, deployment, runbooks, project brief
├── landing/              # Marketing copy drafts and content strategy
└── docker-compose.yml    # Local Postgres (pgvector), Redis, Whisper
```

| Path | Role |
|------|------|
| `apps/web/app/(marketing)/` | Public pages: home, product, pricing, integrations, security |
| `apps/web/app/(app)/` | Authenticated product: dashboard, meetings, tasks, settings |
| `apps/api/src/module/` | Feature modules: route → service → repo per domain |
| `apps/worker/src/handlers/` | One handler per queue stage |
| `packages/database/prisma/` | Source of truth for schema and migrations |

---

# Setup Instructions

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | 9.15.9 |
| Docker | Postgres, Redis, Whisper locally |

### 1. Clone and install

```bash
git clone <repo-url> lume && cd lume
pnpm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

Starts **Postgres** (pgvector on `5432`), **Redis** (`6379`), and **Whisper** (`8000`). First Whisper run downloads models; set `HF_TOKEN` in `.env` if pyannote requires it.

### 3. Environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
```

**Minimum for local boot** (full pipeline needs OpenAI + S3):

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://lume:lume@localhost:5432/lume` |
| `REDIS_URL` | `redis://localhost:6379` |
| `APP_URL` / `FRONTEND_URL` | `http://localhost:3000` |
| `API_URL` / `AUTH_URL` | `http://localhost:3001` |
| `BETTER_AUTH_SECRET` | 32+ random bytes |
| `GOOGLE_CLIENT_ID` / `SECRET` | OAuth console |
| `MICROSOFT_CLIENT_ID` / `SECRET` | Azure AD |
| `AWS_*`, `S3_BUCKET`, `S3_BASE_URL` | Dev bucket |
| `OPENAI_API_KEY` | `sk-…` |
| `WHISPER_URL` / `PYANNOTE_URL` | `http://localhost:8000` |

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `apps/api/.env.example` and `apps/worker/.env.example` for Recall, Stripe, Resend, Slack, Linear, Sentry, and Twilio.

### 4. Database

```bash
pnpm --filter @workspace/database db:generate
pnpm --filter @workspace/database db:migrate
```

### 5. Run development

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/docs |
| API health | http://localhost:3001/health |
| Worker health | http://localhost:9100/health |
| Whisper | http://localhost:8000/health |

Run individually when debugging:

```bash
pnpm --filter web dev
pnpm --filter @workspace/api dev
pnpm --filter @workspace/worker dev
```

### 6. Production build

```bash
pnpm build
pnpm typecheck
pnpm test
```

Deploy topology and secrets: [`docs/deployment.md`](docs/deployment.md).

---

# Tech Stack

### Frontend
- Next.js 16 (App Router), React 19
- Tailwind CSS 4, shadcn/ui
- TanStack Query, TipTap
- Better Auth client

### Backend
- Fastify 5, Zod, fastify-type-provider-zod
- Better Auth + Prisma adapter
- BullMQ worker, Redis
- OpenAPI / Swagger UI

### Database & search
- PostgreSQL 16 + pgvector + pg_trgm
- Prisma ORM and migrations

### AI / ML
- faster-whisper (self-hosted)
- pyannote (speaker diarization)
- OpenAI (summaries, action items, embeddings)

### Integrations & APIs
- Recall.ai (meeting bots, calendar webhooks)
- Stripe (billing)
- Resend (transactional email)
- Slack & Linear (OAuth + delivery jobs)
- Twilio (SMS 2FA)

### DevOps & tools
- pnpm workspaces, Turborepo
- Docker Compose (local)
- Vercel, Railway, AWS S3
- GitHub Actions CI (typecheck, lint, test, schema drift)
- Vitest, ESLint, Prettier
- Pino, Prometheus, Sentry

---

# Reflection

Lume started as frustration with tools that technically worked but did not respect how teams actually recover context after a call. Building it end-to-end — product framing, UI, API, worker, ML adjacency, billing, deploys — taught me that **meaningful software is mostly decisions**: what to defer, what to measure, what to document so future-you does not hate past-you.

I care about products that feel calm to use and honest about their limits (free tier caps, processing time, flat pricing). The Apple Developer Academy lens fits that ethos: design and engineering in service of real people, with room to iterate in public and learn out loud.

If you are reviewing this repo: start with a pasted meeting link or an upload, wait for the document, search for something you remember saying, and push a task to Linear. That loop is the whole point.

---

**Related documentation**

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Developer quick start |
| [docs/architecture-decisions.md](./docs/architecture-decisions.md) | ADRs — technical "why" |
| [docs/project-brief.md](./docs/project-brief.md) | Product context |
| [docs/deployment.md](./docs/deployment.md) | Production checklist |
| [docs/runbooks/](./docs/runbooks/) | Incident playbooks |
