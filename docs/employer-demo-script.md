# Lume — Employer Demo Narrative Script

A walkthrough script for presenting **Lume** to a potential employer: hiring manager, engineering lead, or full-stack interview panel. Use it live (screen share) or as a recorded portfolio walkthrough.

**Suggested formats**

| Format | Duration | Sections to use |
|--------|----------|-----------------|
| **Full demo** | 18–25 min | All acts + architecture close |
| **Engineering deep-dive** | 25–35 min | Full demo + Act 8 + Q&A prep |
| **Short highlight reel** | 8–10 min | Acts 1, 3, 4, 5, 7 (skip marketing depth) |
| **Async video** | 12–15 min | Acts 1–5, brief Act 7, skip settings unless asked |

---

## Before you start

### One-line pitch (memorize)

> **Lume is meeting intelligence for small teams** — it joins Zoom, Google Meet, or Teams (or accepts uploads), turns calls into speaker-aware transcripts and AI summaries, extracts action items, and makes everything searchable in a workspace — with Slack and Linear integrations and flat pricing instead of per-seat enterprise tiers.

### Positioning (why this project matters)

- **Product sense:** Solves a real pain (decisions buried in recordings) with a clear wedge vs. legacy notetakers: modern UX, honest free tier, flat Pro pricing.
- **Full-stack depth:** Monorepo with Next.js, Fastify API, BullMQ worker, self-hosted Whisper/pyannote, PostgreSQL + pgvector, S3, Recall.ai bots, Stripe billing, OAuth integrations.
- **Operability:** Health checks, Prometheus metrics, Sentry, CI schema-drift gate, runbooks — not a throwaway CRUD app.

### Pre-demo checklist (do this 30–60 minutes before)

- [ ] Environment running: `pnpm dev` (or staging URLs) — web `3000`, API `3001`, worker healthy at `9100`, Whisper at `8000` if demoing uploads locally.
- [ ] Signed into a **demo workspace** with a human-readable name (not “Test Workspace 3”).
- [ ] At least **one fully processed meeting** (`SUMMARIZED`) with a realistic title, transcript, summary, and 2–3 action items.
- [ ] Optional but high-impact: one meeting still **processing** (upload in flight) to show live SSE progress.
- [ ] Optional: **second browser profile** (incognito) logged in as a teammate for sharing / “Shared with me.”
- [ ] Integrations: Slack and/or Linear connected if you plan to demo delivery; otherwise skip and say “wired, not shown today.”
- [ ] Recall / Live Sync: only demo live bot join if tunnel + `RECALL_API_KEY` are verified; otherwise use **upload path** as the primary “capture” story.
- [ ] Close unrelated tabs; disable OS notifications; zoom browser to 100–110%.

### Demo data tips

- Prefer a short recording (1–3 min) you’ve already processed — name it like a real standup (“Sprint planning — Mar 12”).
- Seed bulk list data only if needed: `pnpm --filter @workspace/database db:seed` (meetings prefixed `[seed]`).
- Never demo on your personal calendar or sensitive client calls.

---

## Narrative structure

The demo follows a **problem → capture → understand → act → team → trust → engineering** arc. Text in *italics* is optional color commentary; **bold** is emphasis when speaking.

---

## Act 1 — Hook & problem (2 min)

**Screen:** Marketing home — `/`

### What to say

> “Most teams don’t have a ‘meeting problem’ — they have an **after-meeting problem**. Someone was on the call, but a week later nobody remembers what was decided. People re-watch recordings, scroll Slack, or schedule another meeting to re-decide the same thing.
>
> **Lume** is built for small teams that want Fireflies-style intelligence without enterprise pricing or a cluttered UI. The promise is simple: **never re-watch a meeting to remember what was decided.**”

### What to show

1. Hero: headline and subhead — Zoom / Meet / Teams support.
2. Scroll briefly through **How it works** (Join → Understand → Act).
3. Point at reassurance line: **“No credit card · 5 free meetings/month.”**

### Transition

> “I’ll show you the product first, then — if you want — how it’s built under the hood.”

**Navigate:** Click **Start free** or go to `/authentication` if you’ll sign in next; otherwise continue to `/product` for a 30-second product tour on marketing.

---

## Act 2 — Product story on marketing (optional, 2 min)

**Screen:** `/product` and optionally `/pricing`

### What to say

> “The marketing site mirrors the actual app structure — capture, document, tasks, search, workspace. That’s intentional: we’re not selling vaporware features.”

### What to show

| Section | Talking point |
|---------|----------------|
| **Live Sync** | Paste a link; bot joins live call; pipeline runs when call ends. |
| **Uploads** | Same output without a bot — for recordings you already have. |
| **Meeting document** | Overview, takeaways, speaker-aware transcript — ‘built for skimming.’ |
| **Action items** | Extracted tasks; sync to Linear with meeting context. |
| **Search** | Keyword + semantic across workspace. |

**Screen:** `/pricing`

> “**Starter** is free — five meetings a month, full pipeline, AI summaries, search. **Studio Pro** is **$25/month flat per workspace**, not per seat — unlimited meetings, shared workspaces, more storage. That pricing model is part of the product thesis.”

### Transition

> “Let me sign in and show you what a team actually uses day to day.”

---

## Act 3 — Sign-in & first impression (1–2 min)

**Screen:** `/authentication` → `/dashboard`

### What to say

> “Auth is **Better Auth** with Google, Microsoft, and email — sessions are cookie-based against our **Fastify API**, not Next.js API routes. That separation matters for long-running jobs and webhooks; I’ll come back to that.”

### What to show

1. Sign in with your prepared OAuth account (fastest: Google).
2. Land on **dashboard** — note clean layout: sidebar, Live Sync card, recent meetings, upcoming (if calendar connected).

### Transition

> “This is the hub. Two ways to get a meeting into Lume: **join live** or **upload**. I’ll start with the path that’s most reliable in a demo.”

---

## Act 4 — Capture: upload pipeline (4–5 min)

**Primary demo path** — works without Recall tunnel.

**Screen:** `/dashboard/uploads`

### What to say

> “Not every call has a bot. Founders send Loom links, sales sends a Zoom recording, someone forgets to add the assistant. **Uploads** hit the same pipeline: storage, transcription, diarization, AI analysis, embeddings for search.”

### What to show

**Option A — Already processed meeting (safest)**

1. Open **Recent uploads** or dashboard recent list.
2. Click the processed meeting → jump ahead to **Act 5** (meeting document).

**Option B — Live upload (impressive if it completes)**

1. Drop a short `.mp3` or `.m4a` (1–3 minutes).
2. Point out **live status** on the row: transcribing → analyzing → done (SSE-driven, no full page reload).
3. While waiting, narrate the pipeline:

> “File goes to **S3 via presigned URL** — the API never proxies large binaries. The API enqueues **`transcribe`** on Redis; our **worker** calls self-hosted **Whisper**, then **pyannote** for speaker diarization, merges segments, runs **`analyze`** with OpenAI for summary and action items, then **`embed`** into **pgvector** for semantic search. Each stage is its own BullMQ queue so failures retry independently and the API stays fast.”

4. When `SUMMARIZED`, open the meeting.

### If processing is slow

> “Locally Whisper is CPU-bound; in production the Whisper service runs on GPU. The UX is the same — SSE updates the UI as each stage completes.”

### Transition

> “Here’s what the team actually reads — the meeting document.”

---

## Act 5 — Understand: meeting document (5–6 min)

**Screen:** `/meeting/[id]`

### What to say

> “Every meeting becomes a **structured document**, not a wall of raw transcript. The goal is skimming: what happened, what matters, who said what.”

### What to show (in order)

1. **Overview / summary** — AI-generated gist.
2. **Key takeaways** — bullets you’d paste into Slack.
3. **Transcript** — speaker labels; scroll to show attribution (“who said we’re shipping Friday?”).
4. **TipTap editor** — click into summary or takeaways, make a small edit, refresh to show persistence.  
   > “Summaries are editable — the AI draft is a starting point, not locked content.”
5. **Media player** (if audio is available) — optional: play a few seconds.
6. **Star** the meeting — mention it appears under **Starred** later.
7. **Share** dialog (30 seconds):  
   > “Sharing is workspace-aware: restricted, workspace-wide, or link; collaborators can be viewer or editor. Multi-tenant from day one — every query is workspace-scoped.”

### Talking point for engineers

> “The meeting page subscribes to **SSE** (`GET /meetings/:id/events`) for progress and updates — same channel for uploads and bot imports.”

### Transition

> “Summaries are useful; **action items** are what change behavior.”

---

## Act 6 — Act: tasks & integrations (3–4 min)

**Screen:** `/dashboard/tasks`

### What to say

> “Lume extracts action items with owners from the conversation. This view aggregates tasks across meetings so you’re not opening ten documents to see your follow-ups.”

### What to show

1. Tabs (All / Mine — per UI).
2. Mark one task complete — show persistence.
3. Assignee picker — workspace members.
4. **Send to Linear** (if connected):  
   > “One click creates an issue with meeting context — title, description, link back. Slack can auto-post summaries to a channel after processing via the **`deliver-integrations`** job.”

**Screen:** `/dashboard/integrations`

> “Integrations hub is intentionally small: **Slack** and **Linear** — OAuth connect, default channel/team, toggles for auto-delivery. We’d rather do two integrations well than twenty logos on a page.”

### Transition

> “Once you have ten meetings, the product shifts from ‘read this doc’ to ‘find that decision.’”

---

## Act 7 — Recall: search & organization (3–4 min)

**Screen:** Dashboard — open search with **⌘K** (Mac) or **Ctrl+K** (Windows)

### What to say

> “Search is **hybrid**: PostgreSQL **pg_trgm** for keyword matches on titles and text, plus **pgvector** embeddings for semantic queries — ‘what did we decide about pricing?’ even if the word ‘pricing’ isn’t in the title.”

### What to show

1. Search a **known meeting title** — instant keyword hit.
2. Search a **concept** from the summary (e.g. “deployment timeline”) — semantic result after embeddings exist.
3. Open result → correct meeting.

**Screen:** `/dashboard/meetings`

> “Meetings are organized like a modern file library: all meetings, created by me, shared with me, starred, and **channels** for projects or teams.”

### What to show (quick)

1. Filter toolbar — time, source, platform if visible.
2. Row actions — open, share, delete, star.
3. Optional: `/dashboard/starred` — show the meeting you starred.

### Transition

> “For teams, capture and search only matter if onboarding and permissions are sane.”

---

## Act 8 — Team, settings & trust (3–4 min)

Pick **two** of the following based on audience; skip the rest.

### 8a — Live Sync (only if Recall is configured)

**Screen:** `/dashboard` — Live Sync card

> “Paste a **Zoom, Google Meet, or Teams** URL while the call is live. **Recall.ai** dispatches a bot; when the call ends, webhooks trigger **`import-bot-transcript`** — we can skip Whisper when Recall’s transcript is good enough, then run the same analyze → embed → integrate pipeline.”

Show: paste URL → Join → success state → meeting in list with `LIVE` or processing.

**If not configured:**  
> “Live Sync is production-ready via Recall webhooks; for today I’m showing uploads because we don’t tunnel webhooks in a live interview.”

### 8b — People & workspace

**Screen:** `/settings/people`

> “Workspaces are multi-tenant: invite by email, invite links, roles (member/admin; guest on Pro), bulk actions, CSV export.”

**Screen:** `/settings/workspace`

> “Branding — name, handle, avatar. Billing and quotas are per workspace.”

### 8c — Billing (business / PM audience)

**Screen:** `/settings/billing`

> “**Starter**: 5 meetings per month, 300 transcription minutes, single workspace. **Studio Pro**: unlimited meetings, shared workspaces, Stripe Checkout and portal. Quotas return **402-style UX** with an upgrade path — enforced in API middleware, not just the UI.”

### 8d — Security (any audience)

**Screen:** `/security` (marketing) or verbal

> “Audio at rest in S3, TLS in transit, workspace isolation, rate limits on uploads, webhook signature verification for Recall and Stripe. Security contact on the site — we treat call content as sensitive.”

### Transition to technical close

> “That’s the user journey. I want to leave you with how this hangs together as a system.”

---

## Act 9 — Architecture close (3–5 min)

**Screen:** Optional — README architecture diagram, Swagger `/docs`, or a simple whiteboard

### What to say (engineering panel)

> “Lume is a **pnpm + Turborepo monorepo**:
>
> - **`apps/web`** — Next.js 16, React 19, TanStack Query, TipTap, shadcn/ui  
> - **`apps/api`** — Fastify 5, Zod, OpenAPI, Better Auth, webhooks  
> - **`apps/worker`** — BullMQ consumers for the pipeline  
> - **`packages/*`** — shared database (Prisma), queue types, UI, auth config, typed API client  
> - **`services/whisper`** — FastAPI: faster-whisper + pyannote  
>
> **Why split API from Next?** Meeting processing takes minutes. The API enqueues work and returns; workers scale independently. Webhooks from Recall and Stripe hit the API, not serverless functions with tight timeouts.
>
> **Why staged queues?** `transcribe` → `diarize` → `analyze` → `embed` → `deliver-integrations` — retry and observe per stage; Bull Board in dev.
>
> **Search in Postgres** — one operational database; pgvector + pg_trgm instead of bolting on Elasticsearch for a portfolio-scale workload.
>
> **Deploy:** Vercel (web), Railway (API + worker + GPU Whisper), Neon/Railway Postgres, Upstash/Railway Redis, S3. Metrics on `/metrics`, Sentry with release SHA, CI blocks schema drift.”

### Diagram to draw or show

```
Web → REST → API → Redis → Worker → Whisper / OpenAI / S3
              ↓
         PostgreSQL + pgvector
              ↑
         Recall.ai (bots + webhooks)
```

### Close

> “I built this end-to-end — product UX, API design, async pipelines, integrations, billing, and operational docs. The docs folder has ADRs, deployment checklists, and runbooks for worker stuck, OpenAI outage, and Whisper OOM. Happy to go deeper on any layer.”

---

## Short-script cheat sheet (8 minutes)

| Min | Screen | Say / Do |
|-----|--------|----------|
| 0:00 | `/` | Problem + one-line pitch |
| 1:00 | `/authentication` → `/dashboard` | Sign in; show hub |
| 2:00 | `/dashboard/uploads` or recent | “Capture via upload”; open **processed** meeting |
| 3:30 | `/meeting/[id]` | Summary, takeaways, transcript, quick edit |
| 5:00 | `/dashboard/tasks` | Action items; mention Linear/Slack |
| 6:00 | ⌘K search | Keyword + semantic query |
| 7:00 | `/dashboard/meetings` | Lists, filters, channels |
| 8:00 | Verbal / README | Monorepo + worker pipeline one minute |

---

## Backup plans

| Risk | Mitigation |
|------|------------|
| Upload still processing | Use pre-processed meeting; narrate pipeline from README or Bull Board `localhost:3001/admin/queues` |
| Whisper/OOM locally | “Production runs GPU”; show last successful meeting |
| OAuth fails | Pre-open authenticated session; backup email magic link |
| Recall bot fails | Skip Live Sync; uploads + diagram of bot path |
| Search empty | Seed data or keyword search on meeting **title** only |
| Stripe/billing question | Show `/pricing` + `/settings/billing` read-only; don’t run checkout live |

---

## Audience-specific emphasis

### Hiring manager / PM

- Acts 1–7, 8c–8d; light Act 9.
- Emphasize: problem, UX quality, pricing thesis, team workflows, shipping integrations.

### Engineering lead

- Acts 4–5 with pipeline narration; Act 7 search; full Act 9.
- Emphasize: API/worker split, queue stages, SSE, workspace scoping, observability, ADRs in `docs/architecture-decisions.md`.

### Full-stack loop interview

- Be ready to open: `apps/api/src/module/meetings/`, `apps/worker/src/`, `packages/queue/src/jobs.ts`, `packages/database/prisma/schema.prisma`.
- Mention tests: `pnpm test`, CI typecheck/lint/schema drift.

---

## Likely questions & suggested answers

| Question | Answer direction |
|----------|------------------|
| Why not use OpenAI Whisper API only? | Cost and control at scale; self-hosted Whisper for uploads; Recall path can skip STT. |
| Why Recall.ai? | Bot + calendar infra is hard; focus product effort on UX and pipeline, not WebRTC bots. |
| How do you prevent cross-workspace leaks? | Workspace ID on every query and job payload; 404 on cross-tenant IDs. |
| What fails most often? | Worker/Whisper capacity, OpenAI rate limits — runbooks exist; jobs retry per queue. |
| Why TipTap? | Editable meeting docs feel like Notion-lite; users correct AI mistakes inline. |
| How is this different from Fireflies? | Modern UI, flat workspace pricing, small-team focus — see `docs/project-brief.md`. |
| What would you build next? | E2E Playwright, calendar auto-join polish, more integration depth — see `docs/backend-plan.md`. |

---

## Post-demo follow-up

If they want artifacts after the call:

- Repo README — architecture and quick start
- `docs/architecture-decisions.md` — ADRs
- `docs/manual-testing.md` — QA breadth (shows rigor)
- Live URL or 2-minute Loom of Acts 4–6 only

---

## Related documentation

| Doc | Use |
|-----|-----|
| [README.md](../README.md) | Stack, scripts, pipeline |
| [project-brief.md](./project-brief.md) | Product positioning |
| [manual-testing.md](./manual-testing.md) | Feature checklist |
| [architecture-decisions.md](./architecture-decisions.md) | Technical “why” |
| [deployment.md](./deployment.md) | Production topology |

---

*Last updated for Lume monorepo structure (Next.js web, Fastify API, BullMQ worker, Whisper service). Adjust URLs if demoing staging/production instead of localhost.*
