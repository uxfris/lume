# Architecture Decision Records — Lume

This document explains **why** Lume is built the way it is: the constraints we optimized for, the alternatives we rejected, and the trade-offs we accepted. It is written for engineers onboarding to the codebase, reviewers evaluating changes, and future-you deciding whether to revisit a choice.

**Related docs:** [`project-brief.md`](./project-brief.md) (product context), [`backend-plan.md`](./backend-plan.md) (phased implementation plan), [`deployment.md`](./deployment.md) (production topology), [`runbooks/`](./runbooks/) (incident response).

---

## How to read this document

Each decision follows a consistent structure:

| Section | Purpose |
|---------|---------|
| **Status** | `Accepted` (in production), `Accepted with caveats`, or `Open` (not yet finalized) |
| **Context** | Forces and requirements that made a choice necessary |
| **Decision** | What we actually built |
| **Rationale** | Why this option won |
| **Alternatives considered** | Credible options we did not pick |
| **Trade-offs** | Costs we knowingly pay |
| **Consequences** | What this forces on future work |

Decisions are numbered **ADR-001** onward. When you change architecture materially, add a new ADR or mark an old one `Superseded by ADR-NNN`.

---

## System context

Lume is a **meeting intelligence** product: capture calls (live bot or file upload), transcribe with speaker labels, summarize with AI, extract action items, and search across a workspace. The product targets **small teams** that want modern UX and accessible pricing—not enterprise sales cycles.

### Non-functional requirements that drive most decisions

| Requirement | Implication |
|-------------|-------------|
| **Long-running pipelines** (minutes per meeting) | API must not block on transcription or LLM calls |
| **Bursty, expensive compute** (Whisper, embeddings) | Worker and ML services scale independently from the API |
| **Multi-tenant workspaces** | Every query and job must be workspace-scoped |
| **Sensitive audio content** | Presigned URLs, encryption in transit/at rest, minimal retention of secrets in logs |
| **Solo-maintainer velocity** | Monorepo, shared types, managed services where ops cost is high |
| **Portfolio-grade operability** | Health checks, metrics, Sentry, CI schema drift, runbooks |

### High-level topology (as deployed)

```
┌─────────────┐     HTTPS      ┌─────────────┐
│  apps/web   │ ──────────────▶│  apps/api   │
│  (Vercel)   │   cookies+REST │  (Railway)  │
└─────────────┘                └──────┬──────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              PostgreSQL           Redis              AWS S3
              (+ pgvector)        (BullMQ)         (audio blobs)
                    ▲                 │
                    │                 ▼
                    │          ┌─────────────┐
                    └──────────│ apps/worker │──HTTP──▶ services/whisper
                               │  (Railway)  │          OpenAI API
                               └─────────────┘          Recall.ai
```

---

## Decision index

| ID | Title | Status |
|----|-------|--------|
| [ADR-001](#adr-001-pnpm--turborepo-monorepo) | pnpm + Turborepo monorepo | Accepted |
| [ADR-002](#adr-002-separate-fastify-api-not-nextjs-api-routes) | Separate Fastify API (not Next.js API routes) | Accepted |
| [ADR-003](#adr-003-dedicated-bullmq-worker-process) | Dedicated BullMQ worker process | Accepted |
| [ADR-004](#adr-004-postgresql-as-single-source-of-truth) | PostgreSQL as single source of truth | Accepted |
| [ADR-005](#adr-005-pgvector--pg_trgm-for-search) | pgvector + pg_trgm for search | Accepted |
| [ADR-006](#adr-006-prisma-for-schema-and-migrations) | Prisma for schema and migrations | Accepted |
| [ADR-007](#adr-007-aws-s3-with-presigned-uploads) | AWS S3 with presigned uploads | Accepted |
| [ADR-008](#adr-008-self-hosted-whisper--pyannote-service) | Self-hosted Whisper + pyannote service | Accepted |
| [ADR-009](#adr-009-recallai-for-meeting-bots-and-calendar) | Recall.ai for meeting bots (and calendar) | Accepted |
| [ADR-010](#adr-010-dual-ingestion-pipeline-bot-import-vs-full-transcribe) | Dual ingestion pipeline (bot import vs full transcribe) | Accepted |
| [ADR-011](#adr-011-staged-bullmq-queues-not-one-mega-job) | Staged BullMQ queues (not one mega-job) | Accepted |
| [ADR-012](#adr-012-openai-for-analysis-and-embeddings) | OpenAI for analysis and embeddings | Accepted |
| [ADR-013](#adr-013-hybrid-semantic--keyword-search) | Hybrid semantic + keyword search | Accepted |
| [ADR-014](#adr-014-workspace-scoped-multi-tenancy) | Workspace-scoped multi-tenancy | Accepted |
| [ADR-015](#adr-015-better-auth-for-identity) | Better Auth for identity | Accepted |
| [ADR-016](#adr-016-shared-zod-schemas-via-workspacetypes) | Shared Zod schemas via `@workspace/types` | Accepted |
| [ADR-017](#adr-017-route--service--repo-module-layout) | Route → service → repo module layout | Accepted |
| [ADR-018](#adr-018-sse-over-redis-pubsub-for-live-progress) | SSE over Redis pub/sub for live progress | Accepted |
| [ADR-019](#adr-019-split-deployment-vercel--railway--s3) | Split deployment (Vercel + Railway + S3) | Accepted |
| [ADR-020](#adr-020-observability-stack-pino-sentry-prometheus) | Observability stack (pino, Sentry, Prometheus) | Accepted |
| [ADR-021](#adr-021-security-defaults-helmet-rate-limits-csp) | Security defaults (Helmet, rate limits, CSP) | Accepted |
| [ADR-022](#adr-022-ci-schema-drift-gate) | CI schema-drift gate | Accepted |
| [ADR-023](#adr-023-stripe-for-billing-resend-for-email) | Stripe for billing, Resend for email | Accepted |
| [ADR-024](#adr-024-account-deletion-as-shared-package) | Account deletion as shared package | Accepted |

---

## Product & system shape

### ADR-001: pnpm + Turborepo monorepo

**Status:** Accepted

**Context:** Lume ships a Next.js frontend, Fastify API, BullMQ worker, Python Whisper service, and six+ shared TypeScript packages. A solo developer maintains all of them; type drift between web and API is a common source of bugs.

**Decision:** Single repository with `pnpm` workspaces (`apps/*`, `packages/*`) orchestrated by Turborepo (`turbo.json` for `build`, `dev`, `test`, `typecheck`, and Prisma `db:generate` dependencies).

**Rationale:**

- **One `pnpm install`** boots the entire system locally.
- **Shared packages** (`@workspace/types`, `@workspace/database`, `@workspace/queue`, `@workspace/ui`) are versioned together—no publishing friction.
- **Turbo caching** speeds CI and local rebuilds when only one app changes.
- **`globalEnv` in turbo.json** documents which env vars affect builds across services.

**Alternatives considered:**

| Alternative | Why not |
|-------------|---------|
| Polyrepo (web repo + api repo) | Cross-cutting changes (schema + API + client) require coordinated releases; high friction for one person |
| npm/yarn without Turbo | Slower CI; no task graph for `db:generate` before `build` |
| Nx | Heavier; team already standardized on Turbo + pnpm from the shadcn template |

**Trade-offs:** Repo size grows; CI runs more than a single app needs unless filtered. Clone time is higher than a tiny SPA.

**Consequences:** New features that touch DB + API + web should land in one PR when possible. Package boundaries must stay disciplined—avoid importing `apps/api` from `apps/web`.

---

### ADR-002: Separate Fastify API (not Next.js API routes)

**Status:** Accepted

**Context:** The product needs webhooks (Stripe, Recall), long-lived SSE connections, Swagger docs, Bull Board, raw body verification for signatures, and strict rate limits—all while the frontend stays on Vercel's Next.js runtime.

**Decision:** `apps/api` is a standalone **Fastify 5** server. The web app talks to it via REST (`NEXT_PUBLIC_API_URL`). Auth cookies are issued by Better Auth on the API origin (`AUTH_URL`).

**Rationale:**

- **Clear separation of concerns:** Next.js optimizes for UI; Fastify optimizes for HTTP APIs, plugins, and predictable latency budgets.
- **Webhook & SSE fit naturally:** Raw body plugin, `reply.hijack()` for SSE, and no serverless timeout limits on Railway.
- **Independent deploy & scale:** API replicas do not redeploy when marketing pages change.
- **Plugin ecosystem:** `@fastify/helmet`, `@fastify/rate-limit`, `@fastify/swagger`, `fastify-type-provider-zod` are mature and composable.

**Alternatives considered:**

| Alternative | Why not |
|-------------|---------|
| Next.js Route Handlers only | Serverless timeouts fight SSE and multi-minute adjacency; webhooks + queue enqueue clutter the frontend deploy |
| tRPC / GraphQL gateway | Extra abstraction layer; REST + OpenAPI is enough for a BFF-style web client |
| NestJS | Heavier framework; Fastify's plugin model matches the desired thin vertical slices |

**Trade-offs:** Two deployables to configure (CORS, auth cookie domains, env duplication). Local dev runs multiple processes (`pnpm dev`).

**Consequences:** All business mutations go through `apps/api`. The web app should not import Prisma or enqueue jobs directly. API contract changes require updating `@workspace/api-client` and Zod schemas.

---

### ADR-003: Dedicated BullMQ worker process

**Status:** Accepted

**Context:** Transcription, diarization, LLM analysis, and embedding generation can take **1–10+ minutes** per meeting and consume significant CPU, RAM, and external API quota. Users still expect the upload/join endpoint to return immediately.

**Decision:** `apps/worker` is a **long-running Node process** that registers BullMQ workers for each queue defined in `packages/queue/src/jobs.ts`. The API **only enqueues** jobs via `getQueue()`—it never calls Whisper or OpenAI for pipeline work.

**Golden rule (documented in [`backend-plan.md`](./backend-plan.md)):** The API does not perform work that can exceed ~200ms.

**Rationale:**

- **Latency isolation:** API instances stay responsive under transcription load.
- **Failure isolation:** A crashing Whisper call does not take down user-facing HTTP.
- **Scaling:** Worker concurrency (`concurrency: 2` default in `createWorker`) tunes independently from API replicas.
- **Retry semantics:** Expensive jobs use conservative defaults (`attempts: 2`, exponential backoff 60s) in `CONSERVATIVE_DEFAULT_JOB_OPTIONS`—tuned for non-idempotent Whisper/OpenAI work.

**Alternatives considered:**

| Alternative | Why not |
|-------------|---------|
| Inline `await` in API route | Blocks HTTP threads; poor UX; no retry/backoff |
| Serverless functions per job | Cold starts; GPU Whisper incompatible; 15-minute limits |
| Temporal / Inngest | Strong fit at scale; added vendor/complexity for solo MVP |
| Single "pipeline" job | Harder to retry one stage; poor observability per step |

**Trade-offs:** Operational surface: must monitor worker health (`WORKER_HEALTH_PORT`, `/metrics`), Redis availability, and queue depth (`lume_queue_jobs`).

**Consequences:** Every new pipeline stage needs: queue name in `QueueName`, payload type, API enqueue site, and worker handler registration. Status transitions belong in the DB (`Meeting.status`, `ProcessingEvent`).

---

## Data & storage

### ADR-004: PostgreSQL as single source of truth

**Status:** Accepted

**Context:** Meetings, workspaces, memberships, transcripts, tasks, billing state, integrations, and calendar events are relational, transactional, and frequently joined (e.g. list meetings in workspace with owner and channel).

**Decision:** **PostgreSQL 16** (local: `pgvector/pgvector:pg16` via Docker Compose; prod: Neon or Railway) holds all durable application state.

**Rationale:**

- ACID transactions for invitations, billing counters, and workspace membership.
- One backup/restore story for the product.
- Extensions (`vector`, `pg_trgm`) run in-process—no separate search engine to operate early on.

**Alternatives considered:** MongoDB (weak joins for tenancy), DynamoDB (modeling friction for nested meeting docs), SQLite (no managed pgvector hosting path at scale).

**Trade-offs:** Vertical scaling limits; careful indexing required at high row counts (see ADR-005).

**Consequences:** Migrations are mandatory for schema changes; CI blocks drift (ADR-022).

---

### ADR-005: pgvector + pg_trgm for search

**Status:** Accepted

**Context:** Users need to find meetings by **meaning** ("what did we decide about pricing?") and by **exact tokens** (project codenames, attendee names). A separate search SaaS adds cost and sync complexity.

**Decision:**

- **`vector(1536)`** on `MeetingChunk` with OpenAI `text-embedding-3-small` embeddings; cosine distance queries in `search.repo`.
- **`pg_trgm`** GIN indexes for keyword similarity on titles and transcript text.
- **Hybrid ranking** in `search.service.ts`: run semantic and keyword searches in parallel, merge scores per `meetingId`, return top-N.

Embedding queries are **cached in Redis** for 60 seconds (`search:embedding:*` keys) to dedupe repeated spotlight searches.

**Rationale:**

- Keeps search **inside the tenancy boundary** (SQL `WHERE workspaceId = …`).
- No Elasticsearch cluster to run for an MVP.
- Hybrid search outperforms either method alone on short queries and proper nouns.

**Alternatives considered:**

| Alternative | Why not |
|-------------|---------|
| Elasticsearch / Typesense | Ops burden; dual write from pipeline |
| Pinecone / Weaviate | Extra bill; latency hop; workspace filtering is awkward |
| Semantic-only | Misses exact string matches users expect |
| Full-text only (no vectors) | Weak on paraphrased questions |

**Trade-offs:** ivfflat index tuning deferred until >~1000 chunks; raw SQL for vector ops (`$executeRaw`) because Prisma lacks first-class vector types. Re-embedding required if the model dimension changes.

**Consequences:** `embed` queue must run after analysis chunks exist. Search quality depends on chunking strategy in the worker.

---

### ADR-006: Prisma for schema and migrations

**Status:** Accepted

**Context:** The team needs typed DB access, migration history, and Better Auth's Prisma adapter. Some features (vectors, trigram indexes) need raw SQL.

**Decision:** **`schema.prisma` is the source of truth** for models and migrations (`prisma migrate dev` / `db:deploy`). Application code uses `@prisma/client` via `@workspace/database`.

A `drizzle/` directory exists (generated / auxiliary); **new schema work goes through Prisma**, not Drizzle migrations.

**Rationale:**

- Better Auth integration is first-class with `@better-auth/prisma-adapter`.
- Migration folder is battle-tested in CI (`prisma migrate diff --exit-code`).
- Developer ergonomics for relations and `include` trees in repos.

**Alternatives considered:** Drizzle-only (would re-plumb auth adapter), raw SQL migrations (lose typegen), TypeORM (heavier, less aligned with existing code).

**Trade-offs:** Vector columns and some indexes are maintained via raw SQL in repos or manual migrations. Prisma Client bundle size in worker/API.

**Consequences:** Never edit production DB by hand without a migration. Railway start command runs `db:deploy` before API boot.

---

### ADR-007: AWS S3 with presigned uploads

**Status:** Accepted

**Context:** Audio and video files are large (tens to hundreds of MB). Streaming them through the API wastes bandwidth and memory.

**Decision:**

1. Client calls `POST /uploads/presign` → API returns a **presigned PUT URL** and `uploadId`.
2. Browser uploads **directly to S3**.
3. Client calls `POST /uploads/:id/complete` → API verifies object, creates `Meeting`, enqueues `transcribe`.

Workers use **presigned GET** URLs to pass audio to Whisper without proxying bytes through Node.

**Rationale:**

- API stays stateless and cheap per upload.
- S3 durability and lifecycle policies are well understood.
- Matches AWS SDK usage already in api + worker.

**Alternatives considered:**

| Alternative | Why not |
|-------------|---------|
| Upload through API (`multipart`) | Memory spikes; slower; harder to scale |
| Cloudflare R2 / MinIO | [`deployment.md`](./deployment.md) documents presigned URL quirks on non-AWS providers |
| Recall-only storage | Still need user uploads for file path; Recall audio is copied to S3 anyway |

**Trade-offs:** AWS credential management; egress costs; `S3_BASE_URL` must match signing region.

**Consequences:** `complete` must validate upload via `HeadObject` (trust client `fileSize` only for UX, not billing). Rate-limit presign (`20/min/user`).

---

## AI / ML pipeline

### ADR-008: Self-hosted Whisper + pyannote service

**Status:** Accepted with caveats

**Context:** Speech-to-text and speaker diarization are the **cost and latency core** of the product. Managed APIs charge per minute; self-hosting trades ops for unit economics and control.

**Decision:** `services/whisper` is a **Python FastAPI** container exposing:

- `POST /transcribe` — faster-whisper
- `POST /diarize` — pyannote (speaker segments)

Docker Compose runs it locally on port `8000`; production targets **Railway GPU or Hetzner** (`services/whisper/railway.json`).

**Rationale:**

- **Predictable marginal cost** at scale vs per-minute API pricing.
- **Same pipeline** for uploads and bot recordings.
- **Model choice** via env (`WHISPER_MODEL_SIZE`, `WHISPER_COMPUTE_TYPE`, `WHISPER_DEVICE`).

**Alternatives considered** (also noted in [`backend-plan.md` §12](./backend-plan.md)):

| Alternative | When it wins |
|-------------|--------------|
| OpenAI `whisper-1` API | Faster time-to-market; better before ~1000 users if ops burden hurts |
| AssemblyAI / Deepgram | Diarization + STT bundled; higher $/hour, lower ops |
| Recall transcript only | See ADR-010—used for bot path when quality suffices |

**Trade-offs:**

- **OOM risk** on large models—documented in [`runbooks/whisper-oom.md`](./runbooks/whisper-oom.md).
- **HuggingFace token** and pyannote license acceptance required.
- GPU infrastructure is not free; `medium` model needs ~5GB RAM.

**Consequences:** Worker must handle Whisper failures by setting `Meeting.status = FAILED` and writing `ProcessingEvent`—avoid blind BullMQ retries that re-run expensive transcription.

---

### ADR-009: Recall.ai for meeting bots (and calendar)

**Status:** Accepted

**Context:** Building a Zoom/Meet/Teams bot (WebRTC, platform APIs, recording compliance) is a multi-engineer product on its own.

**Decision:** Integrate **Recall.ai** for:

- Dispatching bots to meeting URLs (`POST /bot`)
- Webhooks (`/webhooks/recall`) for recording completion, transcript events, calendar sync
- Optional **live** `transcript.data` streaming when `RECALL_REALTIME_WEBHOOK_URL` is set

**Rationale:**

- Time-to-market for "paste link → bot joins"—the flagship Live Sync flow.
- Calendar V2 webhooks reduce bespoke Google/Microsoft sync code in the app (see Phase 10 in backend plan).

**Alternatives considered:** Build in-house bot infrastructure; use only platform cloud recording APIs (fragmented per provider).

**Trade-offs:**

- Per-minute vendor cost and regional API URLs (`RECALL_API_URL`).
- Webhook endpoints must be **public HTTPS** in dev (tunnel) and **signature-verified** before parsing body.
- Vendor lock-in on bot + calendar features.

**Consequences:** API env includes `RECALL_API_KEY`, `RECALL_WEBHOOK_SECRET`, `RECALL_BOT_NAME`. Failed webhooks should land in a dead-letter path for manual retry (planned hardening in backend plan).

---

### ADR-010: Dual ingestion pipeline (bot import vs full transcribe)

**Status:** Accepted

**Context:** Recall can deliver a **diarized transcript** after the call. Re-running Whisper + pyannote duplicates cost and time when the vendor transcript is acceptable.

**Decision:** Two paths converge at **`analyze`**:

| Path | Trigger | Queues |
|------|---------|--------|
| **Full** | File upload or bot audio without usable transcript | `transcribe` → `diarize` → `analyze` → `embed` |
| **Import** | Recall `transcript.done` webhook | `import-bot-transcript` → `analyze` → `embed` |

Implemented in `packages/queue/src/jobs.ts` (`ImportBotTranscript`) and `apps/worker/src/handlers/import-bot-transcript.ts`.

**Rationale:**

- Cuts minutes and GPU dollars on the common bot path.
- Upload path still uses full quality pipeline under our control.

**Alternatives considered:** Always run Whisper for consistency (simple but wasteful); always use Recall transcript (upload path still needs Whisper).

**Trade-offs:** Two code paths to test; transcript format normalization must match internal `TranscriptSegment` shape.

**Consequences:** Webhook handler must idempotently enqueue with deterministic `jobId` (`import-bot-transcript-${meeting.id}`) to prevent duplicate analysis.

---

### ADR-011: Staged BullMQ queues (not one mega-job)

**Status:** Accepted

**Context:** Pipeline stages have different failure modes, durations, and retry policies. A single job that runs Whisper + diarize + GPT + embed is hard to observe and dangerous to retry.

**Decision:** **One queue per stage:**

`transcribe` · `diarize` · `analyze` · `embed` · `import-bot-transcript` · `deliver-integrations` · `delete-account`

Each handler updates `Meeting.status`, appends `ProcessingEvent`, and enqueues the next stage on success.

**Rationale:**

- **Bull Board** and Prometheus metrics expose per-queue depth.
- **Targeted retries** (e.g. only re-run `analyze` after OpenAI 5xx).
- **Parallel evolution**—add `deliver-integrations` without touching transcription code.

**Alternatives considered:** BullMQ Flows (parent-child); single queue with step field (opaque state machine in one handler).

**Trade-offs:** More boilerplate; risk of orphaned meetings if enqueue fails between stages—mitigated by status + runbooks.

**Consequences:** Document new queues in README and metrics scrapers. Worker health server lists all queue names for depth gauges.

---

### ADR-012: OpenAI for analysis and embeddings

**Status:** Accepted

**Context:** Summaries, action items, and semantic search need an LLM and embedding model. Self-hosting Llama at portfolio scale is ops-heavy.

**Decision:**

- **Analysis:** OpenAI chat completions with structured JSON output (worker `analyze` handler).
- **Embeddings:** `text-embedding-3-small` (1536 dimensions) in `embed` handler.
- **Search queries:** same embedding model with Redis cache (`search.service.ts`).
- Concurrency limited in worker (e.g. `p-limit`) to respect rate limits.

**Rationale:**

- Best quality-to-integration-time ratio for a solo builder.
- Structured outputs reduce parsing bugs vs free-form markdown.
- `gpt-4o-mini` class models are ~15× cheaper than flagship models for summarization (per backend plan guidance).

**Alternatives considered:** Anthropic Claude, Azure OpenAI, local LLM on GPU, open-source embeddings (BGE).

**Trade-offs:** Per-meeting API cost; vendor outage stalls `analyze` ([`runbooks/openai-outage.md`](./runbooks/openai-outage.md)); data leaves VPC to OpenAI (disclose in privacy policy).

**Consequences:** Track `cost_usd` in `ProcessingEvent.metadata` when billing alerts matter. Enforce strict JSON schema validation; mark `FAILED` on garbage responses.

---

### ADR-013: Hybrid semantic + keyword search

**Status:** Accepted

**Context:** See ADR-005. Product marketing promises "keyword or meaning" search.

**Decision:** `searchMeetings` merges semantic (pgvector) and keyword (`pg_trgm`) results with per-source score floors (`MIN_SEMANTIC_SCORE`, `MIN_KEYWORD_SCORE`), then ranks meetings for the workspace.

**Rationale:** Users type both questions and names; hybrid retrieval reduces "no results" frustration.

**Alternatives considered:** RRF fusion libraries, client-side merge only, semantic-only with re-ranker.

**Trade-offs:** Tuning constants are heuristic; may need learning-to-rank later.

**Consequences:** `searchRepo.ensureSearchIndexes()` must run before queries (idempotent index creation).

---

## Application architecture

### ADR-014: Workspace-scoped multi-tenancy

**Status:** Accepted

**Context:** Teams share meetings, tasks, and billing. Data leaks across workspaces are unacceptable.

**Decision:**

- **`Workspace` + `WorkspaceMember`** with roles (`OWNER`, `ADMIN`, `MEMBER`, `GUEST`).
- API resolves tenant via `x-workspace-id` header or first membership (`workspace-access` plugin).
- `app.requireWorkspace` and `app.requireRole` preHandlers on protected routes.
- **Repos always filter by `workspaceId`** even when middleware ran—belt and suspenders.

Signup bootstraps a personal workspace via `ensurePersonalWorkspace` in `@workspace/auth`.

**Rationale:**

- Header-based workspace matches SPA workspace switcher UX.
- Role checks centralize authorization logic.

**Alternatives considered:** Subdomain per workspace (`acme.lume.ai`); org-id only in JWT without header; row-level security only in Postgres.

**Trade-offs:** Clients must send `x-workspace-id` on workspace-scoped calls; forgetting it silently uses oldest membership.

**Consequences:** Every new table with user data needs `workspaceId`. Public meeting shares use separate `MeetingShare` ACL checks (`canUserAccessMeeting`).

---

### ADR-015: Better Auth for identity

**Status:** Accepted

**Context:** Need Google + Microsoft OAuth, email/password, sessions, 2FA (SMS via Twilio), and Prisma-backed users—without building auth from scratch.

**Decision:** `@workspace/auth` wraps **Better Auth** with:

- Prisma adapter
- OAuth providers (Google, Microsoft—with calendar scopes for Recall sync hooks)
- Optional Twilio SMS for phone verification / 2FA
- Fastify mount at `/api/auth/*` with stricter rate limits (higher in dev for session polling)

**Rationale:**

- Faster than custom Passport + session store.
- Cookie-based sessions work with SPA + separate API domain when CORS/trusted origins configured (`FRONTEND_URL`, `AUTH_URL`).

**Alternatives considered:** Auth0/Clerk (cost + vendor); NextAuth only on web (splits session from API); Lucia (more DIY).

**Trade-offs:** `BETTER_AUTH_SECRET` rotation logs everyone out. Typo'd env vars `TWILLIO_*` are entrenched in schema.

**Consequences:** Auth plugin must initialize before routes. Session plugin decorates `request.user`. Web uses `better-auth` client with `NEXT_PUBLIC_APP_URL`.

---

### ADR-016: Shared Zod schemas via `@workspace/types`

**Status:** Accepted

**Context:** API validates with Zod; web forms and React Query expect the same shapes. Duplicated TypeScript interfaces drift.

**Decision:** **`@workspace/types`** exports Zod schemas and inferred types for cross-cutting DTOs (meetings, tasks, people, integrations). Feature-specific schemas may live in `apps/api/src/module/*/*.schema.ts` when not shared.

**Rationale:** Single source of truth; `fastify-type-provider-zod` gives runtime + compile-time safety on routes.

**Alternatives considered:** OpenAPI codegen only; hand-written TS types without runtime validation.

**Trade-offs:** Package must stay lean—no importing Fastify or React into types.

**Consequences:** Breaking schema changes require coordinated web + API releases.

---

### ADR-017: Route → service → repo module layout

**Status:** Accepted

**Context:** First-time maintainability and testability for a growing API surface.

**Decision:** Each feature under `apps/api/src/module/<feature>/`:

| File | Responsibility |
|------|----------------|
| `*.route.ts` | HTTP, Zod schemas, preHandlers |
| `*.service.ts` | Business rules, orchestration, enqueue |
| `*.repo.ts` | Prisma queries only |
| `*.schema.ts` | Feature-local Zod (if not in `@workspace/types`) |

**Rationale:** Services unit-test without Fastify; repos swap if ORM changes; routes stay thin.

**Alternatives considered:** Active Record on Prisma models; vertical "use cases" folders with everything mixed.

**Trade-offs:** More files per feature.

**Consequences:** Enforce in code review—no Prisma in route handlers.

---

### ADR-018: SSE over Redis pub/sub for live progress

**Status:** Accepted

**Context:** Meeting processing spans minutes. Polling `GET /meetings/:id` works but wastes requests and feels sluggish.

**Decision:**

- Worker publishes `ProcessingEvent` payloads to Redis channel `meeting:<id>`.
- API route `GET /meetings/:id/events` opens an **SSE** stream (`fastify-sse-v2`), subscribes, forwards events, sends heartbeat every 15s.
- Web uses `EventSource` in upload flow (`use-upload.ts`) with polling fallback.

**Rationale:**

- **SSE is unidirectional**—matches server→client progress only.
- Simpler than WebSockets (no sticky sessions, auto-reconnect in browsers).
- Redis pub/sub decouples worker process from API connection count.

**Alternatives considered:** WebSockets; long polling only; Supabase Realtime.

**Trade-offs:** HTTP/1.1 connection limits per domain; proxy buffering (mitigated with `X-Accel-Buffering: no`); must `cleanup` on client disconnect to avoid Redis subscriber leaks.

**Consequences:** Recall realtime webhook path can fan into same channel without DB writes for every partial transcript (see `recall-realtime.service.ts` comment).

---

## Integrations & platform services

### ADR-019: Split deployment (Vercel + Railway + S3)

**Status:** Accepted

**Context:** Components have different resource profiles: static/SSR UI, stateless API, queue worker, GPU Whisper, managed Postgres/Redis.

**Decision** (see [`deployment.md`](./deployment.md)):

| Component | Platform |
|-----------|----------|
| `apps/web` | Vercel |
| `apps/api`, `apps/worker` | Railway (separate services, separate `railway.json`) |
| `services/whisper` | Railway GPU or Hetzner |
| Postgres | Neon or Railway |
| Redis | Upstash or Railway |
| Blobs | AWS S3 |

**Rationale:**

- Vercel optimizes Next.js CDN + preview deploys.
- Railway runs long-lived Node and Docker with health checks and `GIT_SHA` for Sentry releases.
- Whisper isolated so GPU bill does not colocate with API CPU.

**Alternatives considered:** Fly.io, Render, single VPS for everything, Kubernetes.

**Trade-offs:** Multi-vendor networking (CORS, webhook URLs, secret sprawl). `next.config.mjs` may proxy `/api` to production API in some setups—document env per environment.

**Consequences:** `pnpm --filter @workspace/database db:deploy` runs on API deploy. Worker uses `restartPolicyType: ALWAYS`.

---

### ADR-020: Observability stack (pino, Sentry, Prometheus)

**Status:** Accepted

**Context:** Production debugging for async pipelines requires correlation across API, worker, and webhooks.

**Decision:**

- **Logs:** Pino on API (JSON in prod, redact auth/Stripe/Recall headers); worker uses pino-compatible logging.
- **Errors:** `@sentry/node` on API (`setupFastifyErrorHandler`) and worker (failed BullMQ jobs tagged with `queue`).
- **Metrics:** Prometheus text at `/metrics` on API and worker (`lume_queue_jobs`, process memory/uptime).
- **Tracing:** `x-request-id` plugin; pass `traceId` into job payloads where implemented.

**Rationale:** Matches common SaaS stack; Railway log drains integrate with Better Stack / Axiom. Queue depth metrics power alerts in runbooks.

**Alternatives considered:** OpenTelemetry only (heavier setup); Datadog (cost).

**Trade-offs:** Sentry sampling and PII policies must be configured; metrics are not a full APM story.

**Consequences:** Leave `SENTRY_DSN_*` blank locally. Set `GIT_SHA=${RAILWAY_GIT_COMMIT_SHA}` in prod.

---

### ADR-021: Security defaults (Helmet, rate limits, CSP)

**Status:** Accepted

**Context:** Auth endpoints, webhooks, and user-generated content attract abuse; meeting audio is sensitive.

**Decision:**

- **API:** `@fastify/helmet`, global rate limit + tighter limits on `/api/auth/*`, `trustProxy` in production, raw body only where signatures require it.
- **Web:** Security headers in `next.config.mjs` (HSTS, `X-Frame-Options`, Permissions-Policy).
- **CSP:** Report-Only policy allowing Stripe Checkout scripts—promote to enforcing after report review (Phase 12 follow-up).
- **Uploads:** Presign rate limit; workspace quota middleware (`requireQuota`) on upload/bot create.

**Rationale:** Defense in depth without waiting for a security audit milestone.

**Alternatives considered:** WAF-only protection; no rate limits (invites credential stuffing).

**Trade-offs:** Report-Only CSP does not block XSS yet. Auth rate limits required tuning (`40/min` prod) because session polling hit `5/min`.

**Consequences:** Document secret rotation in deployment doc (`BETTER_AUTH_SECRET`, Stripe/Recall webhook secrets).

---

### ADR-022: CI schema-drift gate

**Status:** Accepted

**Context:** Prisma schema and migration folder diverging causes production deploy failures and untyped client gaps.

**Decision:** GitHub Actions job `schema-drift`:

1. Start Postgres with pgvector.
2. `prisma migrate deploy`.
3. `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code`.

Main CI job runs typecheck, lint, and tests with dummy env vars.

**Rationale:** Blocks the exact failure mode described in early backend plan gap **G1** (schema out of sync with DB).

**Alternatives considered:** Manual migration review only; `db push` in dev (unsafe for prod).

**Trade-offs:** CI Postgres may not catch extension-specific issues present only on Neon.

**Consequences:** Every `schema.prisma` change needs `prisma migrate dev` committed in the same PR.

---

### ADR-023: Stripe for billing, Resend for email

**Status:** Accepted

**Context:** Studio Pro tier needs checkout, webhooks, and subscription lifecycle. Workspace invites and meeting shares need transactional email.

**Decision:**

- **Stripe:** Checkout sessions, webhooks at `/webhooks/stripe`, optional keys in dev; worker/account-deletion cancels subscriptions on workspace teardown.
- **Resend:** `RESEND_API_KEY` + `RESEND_FROM_EMAIL` for invite and share emails.

**Rationale:** Industry defaults; Stripe Checkout minimizes PCI scope; Resend is simple for product email.

**Alternatives considered:** Paddle/Lemon Squeezy (MoR simplicity vs Stripe ecosystem); SendGrid/Postmark.

**Trade-offs:** Webhook secret rotation requires dual-endpoint overlap; Stripe test mode discipline.

**Consequences:** Billing middleware enforces usage quotas (`UsageCounter`, `requireQuota`). Account deletion package imports Stripe for owned workspaces.

---

### ADR-024: Account deletion as shared package

**Status:** Accepted

**Context:** GDPR-style deletion spans DB rows, S3 objects, Stripe subscriptions, and scheduled grace periods—touched by both API and worker.

**Decision:** `@workspace/account-deletion` encapsulates deletion orchestration; `delete-account` queue triggers the worker sweeper.

**Rationale:** Avoid duplicating destructive logic; single place to audit data removal.

**Alternatives considered:** Inline deletion only in API route; cron-only without queue retry.

**Trade-offs:** Package must stay free of HTTP concerns.

**Consequences:** User model includes `scheduledDeletionAt`; API schedules deletion; worker executes after grace period.

---

## Rejected or deferred alternatives (summary)

| Idea | Verdict | Notes |
|------|---------|-------|
| Next.js API routes as backend | Rejected | ADR-002 |
| Single process API+worker | Rejected | ADR-003 |
| Elasticsearch for search | Deferred | Revisit if Postgres search p95 > target |
| OpenAI Whisper API for MVP | Deferred | Faster ship; migrate when minute volume justifies GPU ops |
| WebSockets for progress | Rejected | ADR-018 |
| Monolithic Railway deploy | Rejected | ADR-019 |
| R2/MinIO instead of S3 | Rejected for now | Presigned URL compatibility |
| Strict CSP enforcement | Deferred | Report-Only until clean reports |
| Integration test harness in CI | Open | Listed in backend plan Phase 12 follow-ups |

---

## Open questions (review periodically)

1. **Whisper hosting economics:** At what monthly minute volume does self-hosted GPU beat OpenAI Whisper API? Revisit ADR-008 with real `ProcessingEvent.metadata.cost_usd` data.
2. **Recall vs own transcript quality:** Do users on the import path report worse diarization? A/B metrics on `Meeting.source`.
3. **Search at scale:** When to add ivfflat tuning vs external vector index?
4. **Auth domain model:** Cookie `SameSite` and cross-domain setup if marketing and app domains diverge.
5. **Drizzle adoption:** If Prisma vector support lands, can Drizzle generated schema be removed to reduce duplication?

---

## Maintaining this document

- **When adding a feature** that introduces a new external service, queue, or storage engine, add an ADR stub in the same PR.
- **When reversing a decision**, mark the old ADR `Superseded by ADR-NNN` and explain migration steps.
- **Quarterly:** Skim the Open questions section with production metrics (queue depth, cost per meeting, search latency).

_Last updated: 2026-05-18 — reflects codebase through Phase 12 hardening (Sentry, metrics, CI drift, Railway deploy, runbooks)._
