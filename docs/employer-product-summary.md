# Lume — Product Summary for Employers

**Context:** This document describes **Lume**, a full-stack meeting intelligence product built independently as a portfolio-grade SaaS application. It is intended for hiring managers, engineering leads, and interview panels evaluating product and engineering depth.

**Author role:** Independent full-stack product engineer (solo design, implementation, and operations).

---

## Product Overview

**Lume** is meeting intelligence for small teams. It joins live calls on Zoom, Google Meet, or Microsoft Teams (via a meeting bot), or accepts audio/video uploads, then turns conversations into **speaker-aware transcripts**, **AI-generated summaries**, **extracted action items**, and **searchable workspace knowledge**.

The product promise is simple: **never re-watch a meeting to remember what was decided.**

Unlike legacy notetakers that optimize for enterprise sales and per-seat pricing, Lume targets teams that want Fireflies-style capabilities with a **modern product experience**, an **honest free tier**, and **flat workspace pricing** instead of escalating seat-based costs.

**Core user journey:** Capture → Understand → Act → Recall

| Stage | What the user gets |
|-------|-------------------|
| **Capture** | Live Sync (paste a meeting URL) or file upload |
| **Understand** | Structured meeting document: overview, takeaways, speaker-labeled transcript |
| **Act** | Action items across meetings; push to Linear; Slack delivery |
| **Recall** | Hybrid keyword + semantic search across the workspace |

---

## Problem Statement

Most teams do not have a “meeting problem” — they have an **after-meeting problem**:

- Decisions and commitments live inside hour-long recordings nobody re-watches.
- Context is scattered across Slack threads, docs, and memory.
- Teams schedule follow-up meetings to re-decide what was already agreed.

Existing tools (e.g. Fireflies.ai and similar) address transcription but often fall short in two ways:

1. **Product experience** — UIs feel dated and heavy; skimming and collaboration are secondary to raw transcript dumps.
2. **Pricing fit for small teams** — Sharp jumps from limited free tiers to per-user enterprise pricing leave startups and indie teams underserved.

Lume exists to close that gap: **intelligence that feels like a modern SaaS product**, priced for teams that are not buying hundred-seat contracts.

---

## Key Features

### Capture

- **Live Sync** — Paste a Zoom, Google Meet, or Teams URL while a call is live; a Recall.ai bot joins, records, and triggers the processing pipeline when the call ends.
- **Uploads** — Drop audio/video files (e.g. Loom exports, Zoom recordings) through the same transcript → summary → tasks pipeline.
- **Calendar connections** — Google and Microsoft OAuth for upcoming meetings and bot scheduling (Recall Calendar V2).

### Meeting documents

- **Structured output** — Overview, key takeaways, and speaker-attributed transcript segments designed for skimming, not wall-of-text reading.
- **Editable content** — TipTap-based editor so AI drafts are a starting point; users correct mistakes inline.
- **Media playback** — Audio aligned with transcript navigation where available.
- **Sharing** — Workspace-scoped sharing: restricted, workspace-wide, or link-based; viewer vs. editor roles.

### Action & workflow

- **Action items** — Tasks extracted from conversations with assignees; aggregated task view across meetings.
- **Linear integration** — One-click issue creation with meeting context and link-back.
- **Slack integration** — OAuth connect; optional auto-delivery of summaries to a channel after processing.

### Organization & discovery

- **Meetings library** — Filters, channels, starred meetings, “created by me” / “shared with me” views.
- **Hybrid search** — Command palette (⌘K / Ctrl+K): PostgreSQL `pg_trgm` for keyword matches plus **pgvector** embeddings for semantic queries (e.g. “what did we decide about pricing?” without that exact word in the title).
- **Channels** — Group meetings by project or team.

### Team & account

- **Multi-tenant workspaces** — Invites, invite links, member/admin roles, guest access on Pro.
- **Billing & quotas** — Starter (free) with monthly meeting and transcription limits; Studio Pro with unlimited meetings and shared workspaces; Stripe Checkout and customer portal.
- **Security posture** — Audio at rest in S3, TLS in transit, workspace isolation on every query, rate limits, webhook signature verification (Stripe, Recall), structured account deletion flow.

### Marketing & onboarding

- Public marketing site aligned with in-app capabilities (capture, document, tasks, search, workspace).
- OAuth sign-in: Google, Microsoft, and email (Better Auth).
- Clear free-tier messaging: no credit card required; 5 meetings/month on Starter.

---

## Target Users

**Primary:** Small teams, startups, and indie hackers who:

- Run recurring meetings on Zoom, Google Meet, or Teams.
- Need meeting intelligence without enterprise per-seat pricing.
- Value clean, fast UI and workflows that fit daily work (search, tasks, integrations).

**Secondary:** Solo founders and consultants who want a single place to capture client or standup calls and retrieve decisions later.

**Not optimized for (by design):** Large enterprises needing deep compliance suites, unlimited integration catalogs, or sales-led procurement workflows.

---

## Technical Highlights

Lume is a **pnpm + Turborepo monorepo** with four independently deployable runtime surfaces — not a single Next.js CRUD app.

### Architecture

```
┌─────────────┐     HTTPS      ┌─────────────┐
│  apps/web   │ ──────────────▶│  apps/api   │
│  (Next.js)  │   cookies+REST │  (Fastify)  │
└─────────────┘                └──────┬──────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              PostgreSQL           Redis              AWS S3
              (+ pgvector)        (BullMQ)         (presigned uploads)
                    ▲                 │
                    │                 ▼
                    │          ┌─────────────┐
                    └──────────│ apps/worker │──HTTP──▶ services/whisper
                               │  (BullMQ)   │          OpenAI API
                               └─────────────┘          Recall.ai
```

### Repository layout

| Area | Responsibility |
|------|----------------|
| `apps/web` | Next.js 16, React 19 — marketing + authenticated app |
| `apps/api` | Fastify 5 — REST, webhooks, auth, OpenAPI/Swagger |
| `apps/worker` | BullMQ consumers for async pipelines |
| `services/whisper` | FastAPI — faster-whisper + pyannote (STT + diarization) |
| `packages/*` | Shared database (Prisma), queue types, UI (shadcn), auth, typed API client, Zod types |

### Why the stack is split this way

| Decision | Rationale |
|----------|-----------|
| **Fastify API separate from Next.js** | Meeting processing takes minutes; webhooks (Stripe, Recall) and SSE must not hit serverless timeouts; API scales independently of marketing deploys. |
| **Dedicated BullMQ worker** | Expensive, bursty work (Whisper, embeddings) off the request path; per-stage retries and observability. |
| **Staged job queues** | `transcribe` → `diarize` → `analyze` → `embed` → `deliver-integrations` — failures retry per stage; API stays fast. |
| **Self-hosted Whisper + pyannote** | Cost and control for upload path; Recall bot path can import transcript and skip STT when quality allows. |
| **PostgreSQL + pgvector + pg_trgm** | One operational database for relational data and hybrid search — no Elasticsearch bolt-on at this scale. |
| **S3 presigned uploads** | Large binaries never proxy through the API. |
| **Recall.ai for bots** | Bot/calendar infrastructure is hard; product effort focuses on UX and pipeline quality. |

### Processing pipelines

**Upload path:** Presigned S3 URL → `transcribe` (Whisper) → `diarize` (pyannote) → merge segments → `analyze` (OpenAI: summary, action items) → `embed` (pgvector) → `deliver-integrations` (Slack/Linear).

**Bot path:** Recall records call → webhook → S3 or `import-bot-transcript` → same downstream analyze → embed → integrate steps.

**Real-time UX:** Server-Sent Events (`GET /meetings/:id/events`) over Redis pub/sub for live processing status without full page reloads.

### Tech stack (summary)

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TanStack Query, TipTap |
| API | Fastify 5, Zod, Better Auth, OpenAPI/Swagger |
| Worker | BullMQ, Node.js |
| Database | PostgreSQL 16, Prisma, pgvector, pg_trgm |
| AI/ML | faster-whisper, pyannote, OpenAI (analysis + embeddings) |
| Integrations | Recall.ai, Stripe, Resend, Slack, Linear |
| Infra | Docker Compose (local), Vercel (web), Railway (API, worker, GPU Whisper), AWS S3, Neon/Upstash or Railway (Postgres/Redis) |

### Operability (portfolio-grade, not throwaway)

- Structured logging (pino), Prometheus metrics (`/metrics`), Sentry with release SHA.
- CI: typecheck, lint, test, **schema-drift gate** (migrations must match Prisma schema).
- Deployment checklist and incident runbooks (worker stuck, OpenAI outage, Whisper OOM).
- Architecture Decision Records (`docs/architecture-decisions.md`) documenting trade-offs.

---

## My Role

As the **sole independent full-stack product engineer** on this project, I owned the product and technical lifecycle end to end:

### Product & design

- Problem definition, positioning, and pricing thesis (Starter vs. Studio Pro).
- User flows: capture → meeting document → tasks → search → team settings.
- Marketing site structure aligned with shipped features (no vaporware sections).
- UX patterns: command palette search, SSE-driven processing states, editable AI summaries.

### Frontend

- Next.js app: marketing pages, authentication, dashboard, meeting detail, settings, billing UI.
- Shared component library (`packages/ui`), data fetching with TanStack Query, typed API client.
- Real-time meeting progress via SSE subscriptions.

### Backend & infrastructure

- Fastify REST API: meetings, uploads, search, workspaces, integrations, billing quotas.
- Webhook handlers (Stripe, Recall) with signature verification and idempotency considerations.
- BullMQ worker and queue contract (`packages/queue`); pipeline orchestration across Whisper, OpenAI, and S3.
- Prisma schema, migrations, workspace-scoped multi-tenancy on every data path.
- Self-hosted Whisper service (FastAPI) and local/production deployment topology.

### Integrations & business logic

- Better Auth (Google, Microsoft, email; 2FA hooks).
- Stripe subscriptions and quota enforcement (API middleware, not UI-only).
- Slack and Linear OAuth, delivery jobs, integration activity logging.
- Recall.ai bot join, calendar connection, and transcript import path.

### Quality & operations

- Vitest test coverage for API, worker, and shared packages.
- GitHub Actions CI, deployment documentation, on-call-style runbooks.
- ADRs for major technical choices; manual testing checklist for release confidence.

---

## Impact & Value Delivered

### For end users (product value)

- **Time saved** — Skimmable meeting documents replace re-watching recordings to recover decisions.
- **Accountability** — Action items with owners and Linear sync reduce “who was supposed to do that?” drift.
- **Institutional memory** — Hybrid search makes past conversations discoverable by title or intent.
- **Accessible entry** — Starter tier lowers the barrier to try the full pipeline; flat Pro pricing avoids per-seat shock for growing teams.

### For employers evaluating this work (engineering value)

- **Full-stack depth** — Demonstrates ability to ship a coherent product across UI, API, async workers, ML adjacency, and third-party integrations.
- **Systems thinking** — Clear boundaries (web / API / worker / Whisper), staged queues, and documented ADRs show intentional architecture under real constraints (long jobs, multi-tenancy, sensitive audio).
- **Product judgment** — Scope discipline (two integrations done well vs. twenty logos), pricing aligned with audience, marketing that matches shipped behavior.
- **Operability mindset** — Health checks, metrics, Sentry, CI schema gate, and runbooks indicate readiness beyond “works on my machine.”
- **Solo delivery velocity** — Monorepo, shared types, and managed services where ops cost is high — appropriate trade-offs for one maintainer shipping a credible SaaS.

### Differentiation vs. incumbents

| Dimension | Lume | Typical incumbents |
|-----------|------|-------------------|
| UX | Modern, skimmable meeting documents | Often dense, transcript-first |
| Pricing | Flat **$25/month per workspace** (Studio Pro) | Per-seat tiers that scale quickly |
| Free tier | **5 meetings/month**, full pipeline | Often more limited or credit-card gated |
| Team fit | Small teams, fast onboarding | Enterprise sales motion |

### Artifacts for deeper review

| Resource | Purpose |
|----------|---------|
| [README.md](../README.md) | Quick start, stack, pipeline overview |
| [employer-demo-script.md](./employer-demo-script.md) | Live walkthrough narrative |
| [architecture-decisions.md](./architecture-decisions.md) | ADRs and technical “why” |
| [deployment.md](./deployment.md) | Production topology |
| [manual-testing.md](./manual-testing.md) | Feature and QA breadth |
| [runbooks/](./runbooks/) | Incident response playbooks |

---

*Lume is a portfolio product demonstrating independent full-stack product engineering: from problem framing and UX through distributed async pipelines, integrations, billing, and production operations.*
