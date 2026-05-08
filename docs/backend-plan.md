# Lume — Backend Development Plan

> Practical, beginner-friendly roadmap for building Lume's backend on the existing monorepo. Written to be followed top-to-bottom over ~14 weeks.

---

## 1. Goals of this document

1. Give you (a first-time backend developer) a clear **mental model** of the system before writing more code.
2. Lay out a **phased, testable roadmap** — each phase produces something demoable.
3. Explain the **"why"** behind every choice, so when you hit a wall you know what to Google.
4. Flag the **concrete gaps** in the current codebase and the exact order to fix them.

You don't need to understand every word on day one. Re-read this doc at the start of each phase.

---

## 2. Mental model: what is a "backend"?

Your backend is really **three** cooperating processes plus some managed services:

| Process            | Runtime          | Role                                                                                  |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------- |
| `apps/api`         | Node (Fastify)   | Answers HTTP requests from the web app. Fast, stateless, never does slow work itself. |
| `apps/worker`      | Node (BullMQ)    | Picks up slow jobs (transcribe, diarize, summarize) from a Redis queue and runs them. |
| `services/whisper` | Python (FastAPI) | A tiny HTTP wrapper around Whisper + pyannote. Worker calls it over HTTP.             |
| PostgreSQL         | Managed          | Source of truth for everything.                                                       |
| Redis              | Managed          | Job queue (BullMQ) + ephemeral caches.                                                |
| S3                 | Managed          | Large binary blobs (audio, video). The DB stores only the key.                        |

The **golden rule**: the API never does anything that can take longer than ~200ms. If a user action triggers slow work (transcription, AI calls), the API writes a row to the DB, enqueues a job, and immediately returns. The worker does the rest and updates the row.

---

## 3. Current state audit

### 3.1 What already exists (good news)

- **Monorepo** with `pnpm` + `turbo` workspaces.
- **Fastify app** (`apps/api`) bootstrapped with plugins: `swagger`, `cors`, `multipart`, `rate-limit`, `better-auth`, `session`, `bullboard`.
- **`@workspace/auth`** package wrapping **BetterAuth** with Google + Microsoft OAuth (scopes already include Google Calendar + Microsoft Graph Calendars.Read) and email/password.
- **`@workspace/database`** with Prisma + pgvector extension.
- **Migrations** already applied for: `user/session/account/verification` (BetterAuth), `Meeting`, `MeetingChunk` (1536-dim embedding), `Upload`, `ProcessingEvent`.
- **`@workspace/types`** shared Zod schemas between web + api.
- **`@workspace/api-client`** thin `fetch` wrapper (currently using mock data).
- **S3 presigned upload helper** (`apps/api/src/lib/s3-predesign.ts`).
- **Docker Compose** with `pgvector/pgvector:pg16` + Redis.

### 3.2 Critical gaps (must fix first)

| #      | Issue                                                                                                                                                                                      | Why it matters                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **G1** | `schema.prisma` **only defines BetterAuth models**. Migrations created `Meeting`, `Upload`, `MeetingChunk`, `ProcessingEvent` — but those models are **not in `schema.prisma`**.           | The Prisma client is blind to these tables. The next `prisma generate` will lose them. This is the single most urgent fix. |
| **G2** | `apps/api/package.json` declares a dependency on **`@workspace/queue`** — but no such package exists.                                                                                      | Build will break the moment you import anything queue-related.                                                             |
| **G3** | `apps/worker/` is **empty**.                                                                                                                                                               | No transcription pipeline is possible yet.                                                                                 |
| **G4** | `apps/api/src/module/auth/auth.service.ts` still contains a **hard-coded `verified@example.com`** placeholder.                                                                             | Dead code; delete once real session flow is verified.                                                                      |
| **G5** | `apps/api/src/types/fastify.d.ts` types `user`/`session` as `any`.                                                                                                                         | No intellisense, no safety on protected routes.                                                                            |
| **G6** | No `Workspace` / `WorkspaceMember` / `Task` / `Integration` / `CalendarEvent` tables — but the UI already expects them (see `packages/types/src/people.ts`, `task.ts`, `integrations.ts`). | All multi-tenant logic and the tasks/people pages cannot talk to a real DB yet.                                            |
| **G7** | CORS only allows `APP_URL`, but Better-Auth uses `FRONTEND_URL`. Methods whitelist excludes `PUT`/`PATCH`/`DELETE`.                                                                        | Mutations from the frontend will be blocked.                                                                               |
| **G8** | No centralized **logger config**, no **request-id**, no **Sentry**.                                                                                                                        | You will not be able to debug production issues.                                                                           |
| **G9** | No tests, no CI.                                                                                                                                                                           | Regressions will land silently.                                                                                            |

### 3.3 Minor gaps

- `packages/utils/src/` is empty (no `package.json`).
- `packages/config/` exists as a folder but isn't a workspace package.
- No `.env.example` file at the root of `apps/api`.

---

## 4. Target architecture

```
                    ┌────────────────────┐
                    │  Next.js (apps/web)│
                    └─────────┬──────────┘
                              │  HTTPS (cookies)
                              ▼
                    ┌────────────────────┐         ┌───────────────┐
                    │  Fastify (apps/api)│────────▶│ PostgreSQL 16 │
                    │   - Routes         │         │  + pgvector   │
                    │   - Zod validation │         │  + pg_trgm    │
                    │   - BetterAuth     │         └───────────────┘
                    │   - Presigned URLs │
                    └──────┬──────┬──────┘
                           │      │
                           │      │ enqueue
                  get/put  │      ▼
                    ┌──────▼──┐  ┌──────────┐
                    │   S3    │  │  Redis   │
                    └─────────┘  │ (BullMQ) │
                                 └────┬─────┘
                                      │ consume
                                      ▼
                              ┌────────────────────┐
                              │ Worker (apps/worker)│
                              │  - transcribe job  │
                              │  - diarize job     │
                              │  - analyze job     │
                              │  - embed job       │
                              └──────┬─────────────┘
                                     │ HTTP
                      ┌──────────────┼────────────────┐
                      ▼              ▼                ▼
             ┌────────────┐  ┌─────────────┐  ┌─────────────┐
             │  Whisper   │  │   pyannote  │  │  OpenAI API │
             │  (FastAPI) │  │  (FastAPI)  │  │  (external) │
             └────────────┘  └─────────────┘  └─────────────┘
```

### 4.1 Request flow — file upload

1. Web → `POST /uploads/presign` → API returns `{ uploadId, key, url }`.
2. Web uploads the file directly to S3 via the presigned URL.
3. Web → `POST /uploads/:id/complete` → API marks upload `UPLOADED`, creates a `Meeting` row (`PROCESSING`), enqueues `transcribe` job.
4. Worker runs `transcribe` → `diarize` → `merge` → `analyze` → `embed` chain, appending a `ProcessingEvent` row at each stage.
5. Web polls `GET /meetings/:id` (or subscribes to SSE — phase 9) until `status = SUMMARIZED`.

### 4.2 Request flow — bot join (Recall.ai)

1. Web → `POST /meetings/bot` `{ meetingUrl }` → API creates `Meeting` row (`SCHEDULED`) and calls Recall.ai to dispatch a bot.
2. Recall.ai webhook → `POST /webhooks/recall` → API updates status, stores audio S3 key, enqueues `transcribe` (or imports Recall's own transcript and skips to `analyze`).
3. From there: identical to the file upload pipeline.

---

## 5. Data model plan

The final schema is larger than what's committed today. Below is the **target** — aim to reach it incrementally across phases 1–7.

### 5.1 Naming conventions (pick one and stick with it)

- **Table names**: PascalCase singular (`Meeting`, `WorkspaceMember`) — matches your current convention.
- **Columns**: camelCase (Prisma default).
- **IDs**: `cuid()` by default; `uuid()` only where exposed publicly.
- **Timestamps**: always `createdAt` + `updatedAt` (use `@default(now())` + `@updatedAt`).

### 5.2 Target Prisma models (summary)

| Model                                        | Purpose                                    | Key fields                                                                                                                              |
| -------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `User` (exists)                              | BetterAuth identity                        | `id`, `email`, `name`, `image`                                                                                                          |
| `Session`, `Account`, `Verification` (exist) | BetterAuth                                 | —                                                                                                                                       |
| **`Workspace`** (new)                        | Tenant boundary                            | `id`, `name`, `slug`, `ownerId`                                                                                                         |
| **`WorkspaceMember`** (new)                  | Join table                                 | `workspaceId`, `userId`, `role` (`OWNER`/`ADMIN`/`MEMBER`/`GUEST`), `joinedAt`                                                          |
| **`Invitation`** (new)                       | Pending invites                            | `workspaceId`, `email`, `role`, `token`, `expiresAt`                                                                                    |
| `Meeting` (exists, add to prisma)            | Core entity                                | `id`, `workspaceId`, `userId`, `title`, `status`, `source` (`UPLOAD`/`BOT`), `audioKey`, `durationSeconds`, `language`, `summary JSONB` |
| `Upload` (exists, add to prisma)             | Tracks raw file upload                     | `id`, `userId`, `workspaceId`, `key`, `fileName`, `fileType`, `status`, `meetingId?`                                                    |
| `MeetingChunk` (exists, add to prisma)       | Semantic search                            | `id`, `meetingId`, `content`, `embedding vector(1536)`, `startMs`, `endMs`                                                              |
| `ProcessingEvent` (exists, add to prisma)    | Pipeline log                               | `id`, `meetingId`, `stage`, `message`, `metadata JSONB`                                                                                 |
| **`TranscriptSegment`** (new)                | Raw Whisper+speaker output                 | `meetingId`, `speaker`, `startMs`, `endMs`, `text`, `index`                                                                             |
| **`Task`** (new)                             | Action items extracted from meetings       | `id`, `workspaceId`, `meetingId?`, `title`, `assigneeId?`, `isCompleted`, `dueAt?`                                                      |
| **`Integration`** (new)                      | Per-workspace integration connection state | `workspaceId`, `provider`, `status`, `config JSONB`                                                                                     |
| **`CalendarEvent`** (new)                    | Cached upcoming meetings from Google/MS    | `userId`, `externalId`, `startAt`, `endAt`, `platform`, `joinUrl`                                                                       |
| **`UsageCounter`** (new)                     | Minutes/month metering                     | `workspaceId`, `period`, `minutesTranscribed`                                                                                           |

### 5.3 Indices to remember

- `Meeting(workspaceId, createdAt DESC)` — dashboard list.
- `MeetingChunk` — add `USING ivfflat (embedding vector_cosine_ops)` after you have enough rows (phase 9).
- `Task(workspaceId, isCompleted, createdAt DESC)`.
- Full-text on `Meeting.title` via `pg_trgm` GIN index.

---

## 6. Coding conventions (internalize these early)

These are the patterns you'll copy-paste for every new feature. Master them once.

### 6.1 Folder layout per feature module

```
apps/api/src/module/<feature>/
  ├── <feature>.route.ts       // Fastify routes + Zod schemas (the only file that knows HTTP)
  ├── <feature>.service.ts     // Pure business logic (no req/reply here)
  ├── <feature>.repo.ts        // Prisma calls (the only file that knows the DB)
  └── <feature>.schema.ts      // Shared Zod schemas for this feature (import from @workspace/types when possible)
```

**Why this split?** Keeping HTTP, business logic, and DB in separate files means you can unit-test services without spinning up Fastify, and you can swap Prisma later without rewriting routes.

### 6.2 Route template

```ts
// apps/api/src/module/meetings/meetings.route.ts
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { MeetingService } from "./meetings.service";

export async function meetingsRoute(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Meetings"],
        summary: "List meetings in current workspace",
        querystring: z.object({
          cursor: z.string().optional(),
          limit: z.coerce.number().min(1).max(100).default(20),
        }),
      },
    },
    async (req) => {
      return MeetingService.list({
        workspaceId: req.workspace.id,
        ...req.query,
      });
    },
  );
}
```

### 6.3 Authentication & authorization

- `app.verifySession` already exists → attaches `request.user` + `request.session`.
- Add a new **`app.requireWorkspace`** preHandler (phase 2) that resolves the current workspace from a header (`x-workspace-id`) or path param, verifies the user is a member, and attaches `request.workspace` + `request.membership`.
- Add **`app.requireRole("ADMIN" | "OWNER")`** for admin-only routes.

### 6.4 Error handling

- Throw `app.httpErrors.badRequest("…")` / `notFound()` / `forbidden()` from `@fastify/sensible` (already installed).
- One global error handler (already exists) converts to RFC-7807 shape. Update it to also include `request.id` as `trace_id` so `ApiErrorSchema` in `api-client` receives it.

### 6.5 Validation

- Always validate **input** with Zod (body, params, query).
- Install `fastify-type-provider-zod` (already in deps) and set it up once in `app.ts`:

```ts
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
```

This gives you both runtime validation AND perfect TypeScript inference on `req.body` / `req.query`.

### 6.6 Logging

- Use `request.log.info({ …ctx }, "message")` — never `console.log`.
- Generate a `x-request-id` header in a plugin; pipe it through to worker jobs as `jobData.traceId`.

---

## 7. Phased roadmap (14 weeks)

Each phase has: **goal**, **ordered tasks**, **deliverable**, **gotchas**, **rough hours**.

The timeline assumes 30h/week. Buffer is baked into the last phase.

---

### Phase 0 — Foundation cleanup (Week 1, ~25h)

**Goal:** fix the critical gaps (G1–G7) so the existing scaffolding is a trustworthy base.

**Tasks:**

1. **Sync `schema.prisma`** with what's already in the DB. Add `Meeting`, `Upload`, `MeetingChunk`, `ProcessingEvent` models matching the migrations exactly. Run `prisma db pull` first to auto-generate, then clean up. (**G1**)
2. **Create the `@workspace/queue` package.** Inside: a thin wrapper around BullMQ exposing `getQueue(name)`, `getWorker(name, handler)`, typed job payloads. Move `apps/api/src/queues/ingestion.queue.ts` (referenced by `bullboard.ts`) here. (**G2**)
3. **Scaffold `apps/worker`** with `package.json`, `tsconfig.json`, `src/index.ts` that just logs "worker online". (**G3**)
4. **Delete placeholder `auth.service.ts`** and its imports. (**G4**)
5. **Harden `fastify.d.ts`** — type `request.user` as BetterAuth's `User`, `request.session` as `Session`. (**G5**)
6. **Fix CORS** — use `FRONTEND_URL`, allow all REST methods, expose `x-request-id`. (**G7**)
7. **Write `apps/api/.env.example`** and `apps/worker/.env.example`. Document every variable.
8. **Register Zod type provider** in `app.ts` (see §6.5).
9. **Add `turbo.json` globalEnv** entries for new vars (`REDIS_URL`, `OPENAI_API_KEY`, etc.).

**Deliverable:** `pnpm dev` boots api + worker + postgres + redis; `GET /health` works; `prisma generate` produces typed client for all models; Bull Board loads at `/admin/queues`.

**Gotchas:**

- After syncing `schema.prisma`, do **not** `prisma migrate dev` (it would try to create tables that already exist). Use `prisma migrate resolve` or manually mark the current state as baseline.
- `@fastify/swagger` needs the Zod compiler to be registered **before** routes.

---

### Phase 1 — Workspace & multi-tenancy (Week 2, ~30h)

**Goal:** every resource from now on lives inside a workspace. Get the tenancy primitive right before you build anything on top of it.

**Tasks:**

1. Migration: add `Workspace`, `WorkspaceMember`, `Invitation` tables.
2. BetterAuth `databaseHooks`: on user creation, auto-create a personal workspace + membership (role `OWNER`).
3. Module `workspaces/`: endpoints `GET /workspaces` (list mine), `POST /workspaces`, `PATCH /workspaces/:id`, `POST /workspaces/:id/invitations`, `POST /invitations/:token/accept`.
4. `app.requireWorkspace` + `app.requireRole` preHandlers.
5. Add `workspaceId` foreign key to `Meeting` and `Upload` (migration + data backfill — trivial since DB is empty).

**Deliverable:** you can sign up, see a default workspace in your session, invite someone by email, and protect a test route behind `requireRole("ADMIN")`.

**Gotchas:**

- Workspace slug must be **globally unique**. Generate from name + short random suffix.
- Invitation tokens: store a **hash**, send the raw token by email, single-use, 7-day expiry.

---

### Phase 2 — Upload pipeline skeleton (Week 3, ~30h)

**Goal:** end-to-end "upload a file → row exists in DB → job sits in Redis queue". No transcription yet.

**Tasks:**

1. Module `uploads/` with three endpoints:
   - `POST /uploads/presign` `{ fileName, fileType, fileSize }` → returns presigned URL + `uploadId`.
   - `POST /uploads/:id/complete` → marks upload `UPLOADED`, creates `Meeting`, enqueues `transcribe` job.
   - `GET /uploads` → list recent uploads in workspace (wire up `RecentUploads` page).
2. Define `transcribe` queue + job payload type
3. Worker: register a stub handler that logs `{ jobId, meetingId }` and marks `Meeting.status = TRANSCRIBED` after 3 seconds (mocked).
4. Rate-limit `POST /uploads/presign` (e.g. 20/min/user) to prevent S3 abuse.
5. Validate `fileType` against an allowlist (`audio/*`, `video/*`, `application/pdf`).

**Deliverable:** the "Uploads" page in the web app can be switched from `MOCK_UPLOADS` to real data. Uploading a file creates a Meeting whose status cycles `UPLOADED → TRANSCRIBED` (faked) within seconds.

**Gotchas:**

- Browsers can't `PUT` a presigned URL with arbitrary headers. The S3 signature must match exactly what the browser sends — don't add `Content-Disposition` on one side and not the other.
- Never trust client-supplied `fileSize` for billing; read `ContentLength` from the S3 `HeadObject` call in the `complete` endpoint instead.

---

### Phase 3 — Real transcription (Week 4, ~30h)

**Goal:** replace the stub worker with actual Whisper output.

**Tasks:**

1. Create `services/whisper/` — a small Python FastAPI app with one route: `POST /transcribe` `{ audioUrl }` → returns `{ text, segments[] }`. Use `faster-whisper` (4× faster than vanilla) with a `small` model locally, `medium` in prod.
2. Add `services/whisper/Dockerfile` and a `docker-compose.yml` service so it runs alongside postgres + redis.
3. Worker `transcribe` handler:
   - Generate a **presigned GET URL** for the audio key.
   - `POST` it to the Whisper service.
   - Stream `TranscriptSegment` rows into DB (one insert per segment, or batched).
   - Update `Meeting.status = TRANSCRIBED`, `durationSeconds`, `language`.
   - Append `ProcessingEvent { stage: "TRANSCRIBE", message: "done in 42s" }`.
   - Enqueue `diarize` job.
4. Error handling: on any step failure, set `status = FAILED`, write event, do **not** throw (BullMQ would retry the expensive Whisper call).

**Deliverable:** upload a real 5-minute audio clip → ~30s later `TranscriptSegment` rows exist in the DB.

**Gotchas:**

- Whisper memory spikes: a `medium` model needs ~5GB RAM. Don't run it on the same box as Postgres in dev.
- Set BullMQ `attempts: 2, backoff: { type: 'exponential', delay: 60_000 }`.
- Save the raw Whisper JSON to S3 (`transcripts/<meetingId>.json`) as a backup before parsing — cheap insurance.

---

### Phase 4 — Diarization & transcript merge (Week 5, ~30h)

**Goal:** assign each utterance to a speaker. Produce data that matches `ConversationMessageSchema` in `@workspace/types`.

**Tasks:**

1. Add a `/diarize` endpoint to the Python service wrapping pyannote. Input: audioUrl. Output: `[{ speaker, startMs, endMs }]`.
2. Worker `diarize` handler:
   - Call Python service.
   - Merge Whisper segments + pyannote windows by time-overlap (pick the diarization speaker whose window covers the segment midpoint).
   - Update `TranscriptSegment.speaker`.
   - Enqueue `analyze` job.
3. Build a helper `toConversation(meetingId)` in `meetings.repo.ts` that returns data shaped like `ConversationSchema`.
4. Endpoint `GET /meetings/:id/conversation` → uses that helper.

**Deliverable:** meeting detail page can render a real diarized transcript.

**Gotchas:**

- pyannote needs a HuggingFace token and acceptance of two model licenses — do this on day one of this phase, not hour one.
- Group "unknown" speakers as `Speaker A/B/C…`; let users rename later (out of scope now).

---

### Phase 5 — AI analysis (Week 6, ~30h)

**Goal:** produce summary + action items + sentiment using OpenAI.

**Tasks:**

1. Library `apps/worker/src/lib/openai.ts` with: `summarize(transcript)`, `extractActionItems(transcript)`, `embed(chunk)`.
2. Worker `analyze` handler:
   - Chunk transcript into ~500-token windows with 50-token overlap.
   - Call OpenAI `gpt-4o-mini` (cheap) with a single structured-output call that returns `{ summary, keyPoints[], actionItems[{title, assigneeHint?}] }`.
   - Store in `Meeting.summary` JSONB.
   - For each action item, `INSERT INTO "Task"` (assignee left null for now; fuzzy-match against WorkspaceMember in a later iteration).
   - Enqueue `embed` job.
3. Worker `embed` handler:
   - For each chunk, call `text-embedding-3-small`.
   - Upsert into `MeetingChunk` (use `Prisma.$executeRaw` for the `vector(1536)` column — Prisma doesn't natively support vector ops yet).
   - On completion set `Meeting.status = SUMMARIZED`.

**Deliverable:** uploading a file yields a meeting with a human-readable summary and checkbox list of action items ~2 minutes later.

**Gotchas:**

- Enforce `response_format: { type: "json_schema", strict: true }` with a Zod-derived schema. If the LLM returns garbage, log and mark `FAILED`.
- Track cost per meeting in `ProcessingEvent.metadata.cost_usd`. You will want this for billing.
- OpenAI rate limits — add a semaphore (e.g. `p-limit(5)`) in the worker.

---

### Phase 6 — Meetings & tasks REST APIs (Week 7, ~30h)

**Goal:** wire the frontend (currently mocked) to real data.

**Tasks:**

1. Module `meetings/` — `GET /` (cursor pagination), `GET /:id`, `PATCH /:id` (title, sharing), `DELETE /:id` (soft delete — set `deletedAt`).
2. Module `tasks/` — `GET /`, `POST /`, `PATCH /:id`, `POST /:id/toggle`, `DELETE /:id`. Match `ActionItemSchema` / `TasksGroupSchema`.
3. Replace the mock implementations in `packages/api-client/src/meeting.api.ts` and `task.api.ts` with real `client.get/post/...` calls.
4. In the web app, swap `queryFn: meetingApi.getMeetings` → real endpoint. TanStack Query is already set up.

**Deliverable:** dashboard, meeting detail, and tasks pages all stop using `MOCK_*` data.

**Gotchas:**

- Always scope queries by `workspaceId` in the repo layer — never rely only on the middleware. Belt-and-braces.
- Cursor pagination > offset pagination for infinite lists. Base the cursor on `(createdAt, id)`.

---

### Phase 7 — Search (Week 8, ~25h)

**Goal:** "spotlight" across meetings — hybrid keyword + semantic.

**Tasks:**

1. Add GIN trigram index on `Meeting.title` + `TranscriptSegment.text`.
2. Add ivfflat index on `MeetingChunk.embedding` once you have >1000 rows.
3. Endpoint `GET /search?q=…` that does:
   - Embed `q`.
   - `SELECT meetingId, chunkId, 1 - (embedding <=> $1) AS score FROM "MeetingChunk" ORDER BY embedding <=> $1 LIMIT 20`.
   - `SELECT … FROM "Meeting" WHERE title % $q` (trigram).
   - Merge + rank.
4. Wire to the search dialog (`apps/web/app/(app)/dashboard/_components/search-dialog/`).

**Deliverable:** typing in the command palette returns real results.

**Gotchas:**

- `<=>` is cosine distance **only** if your index uses `vector_cosine_ops` — double-check.
- Cache embedding of `q` in Redis for 60s; repeated identical queries are common.

---

### Phase 8 — Recall.ai bot (Week 9, ~30h)

**Goal:** user pastes a Zoom/Meet URL → Lume joins and transcribes.

**Tasks:**

1. Module `bots/`:
   - `POST /meetings/bot` `{ meetingUrl, scheduledAt? }` → creates Meeting (`status: SCHEDULED`), calls Recall `POST /bot`, stores Recall bot id.
   - `POST /webhooks/recall` (no auth; verify signature) → on `bot.done` event, download audio from Recall, upload to S3, enqueue `transcribe` (or import Recall's transcript + enqueue `analyze`).
2. Add `Meeting.source` enum (`UPLOAD` | `BOT`), `Meeting.externalBotId`, `Meeting.platform`.
3. Dead-letter queue for webhooks that fail 5× — write to a `FailedWebhook` table for manual retry.

**Deliverable:** a live Zoom meeting is captured end-to-end without human intervention.

**Gotchas:**

- Recall webhook signatures: verify BEFORE parsing the body.
- Your webhook URL must be publicly reachable in dev — use `cloudflared tunnel` or `ngrok`.

---

### Phase 9 — Real-time updates (Week 10, ~25h)

**Goal:** stop the web app from polling; push progress updates instead.

**Tasks:**

1. Add a Fastify SSE plugin (`fastify-sse-v2`). Route: `GET /meetings/:id/events` (server-sent events stream).
2. Worker publishes to a Redis pub/sub channel `meeting:<id>` on each `ProcessingEvent`.
3. API subscribes in the SSE handler and forwards to the client.
4. On the web: `EventSource` + TanStack Query `setQueryData` to update the meeting in cache.

**Deliverable:** uploading a file shows a live progress log with zero polling.

**Gotchas:**

- Remember to close subscriptions on client disconnect (memory leaks will kill the API).
- SSE over HTTP/1.1 counts against the browser's 6-connection limit per origin.

---

### Phase 10 — Calendar integration (Week 11, ~25h)

**Goal:** populate "Upcoming meetings" using Recall.ai's calendar aggregation layer (instead of provider-specific Google/MS sync logic in our app).

**Tasks:**

1. Extend `POST /webhooks/recall` to handle Calendar V2 events (`calendar*` family) in near real-time.
2. Normalize Recall Calendar V2 event payloads into `CalendarEvent` (`provider`, `externalId`, `startAt`, `endAt`, `joinUrl`, `platform`, `metadata`).
3. Upsert/delete idempotently (unique key: `workspaceId + userId + provider + externalId`) using event ids and `is_deleted`.
4. Expose `GET /calendar/upcoming` returning `UpcomingMeetingGroup[]` for the dashboard.

**Deliverable:** the dashboard's "Upcoming" component shows real events.

**Gotchas:**

- Calendar webhooks can arrive out of order; rely on idempotent upserts + deletes keyed by provider event id.
- Keep Recall payload copies in `metadata` for debugging, but never trust raw payload types at runtime without validation.

---

### Phase 11 — Billing & usage metering (Week 12, ~25h)

**Goal:** enforce the "300 min/month free, $8/mo Pro" tiers.

**Tasks:**

1. Table `UsageCounter(workspaceId, period YYYY-MM, minutesTranscribed)`.
2. Worker bumps the counter atomically after each successful `transcribe`.
3. Middleware `requireQuota` on `POST /uploads/presign` and `POST /meetings/bot`.
4. Stripe: one product, one monthly price. `POST /billing/checkout` returns a Stripe Checkout session. Webhook updates `Workspace.plan`.
5. `GET /billing` returns current usage + plan.

**Deliverable:** exceeding 300 min on Starter returns HTTP 402 with a clear error body.

**Gotchas:**

- Use Stripe's test mode clock for time-based tests.
- Race condition on counter: use `UPDATE … SET minutesTranscribed = minutesTranscribed + $1` inside a transaction.

---

### Phase 12 — Hardening, observability, deployment (Weeks 13–14, ~50h)

**Goal:** production-ready. No heroics, just the checklist.

**Tasks:**

1. **Testing**
   - Unit tests for every service (Vitest) — aim for the happy path + one error path each.
   - Integration tests for 3 critical flows (upload → summary; signup → default workspace; invite → accept). Use a `test` database and `@prisma/client` in a fresh schema per test.
2. **CI** — GitHub Actions: install, typecheck, lint, test, `prisma migrate diff --exit-code` to block un-migrated schema changes.
3. **Observability**
   - Sentry on api + worker.
   - Structured logs shipped to Better Stack / Axiom.
   - `/metrics` endpoint (Prometheus format) — queue depth, job durations.
4. **Security**
   - Helmet plugin.
   - Stricter rate limit on auth routes (5/min).
   - CSP headers via Next middleware.
   - Rotate `BETTER_AUTH_SECRET` process documented.
5. **Deployment**
   - `apps/api` and `apps/worker` → separate Railway services.
   - `services/whisper` → Railway with a GPU plan, or run on a cheap Hetzner GPU box.
   - Postgres → Railway or Neon (managed pgvector on either).
   - Redis → Upstash.
   - S3 → AWS proper (not a clone — presigned URLs are finicky elsewhere).
   - Single `railway.json` per service with health-check URLs.
6. **Runbooks** — one-pager per failure mode (worker stuck, OpenAI outage, Whisper OOM).

**Deliverable:** can deploy a new version with `git push` and you sleep soundly.

---

## 8. Environment variables (master list)

Add these to `apps/api/.env.example` and `apps/worker/.env.example` as appropriate.

```dotenv
# Shared
NODE_ENV=development
DATABASE_URL=postgresql://lume:lume@localhost:5432/lume
REDIS_URL=redis://localhost:6379

# API
PORT=3001
HOST=0.0.0.0
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
AUTH_URL=http://localhost:3001
JWT_SECRET=change-me-to-32-random-bytes
BETTER_AUTH_SECRET=change-me-to-32-random-bytes
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=lume-dev
S3_BASE_URL=https://lume-dev.s3.us-east-1.amazonaws.com

# Worker
WHISPER_URL=http://localhost:8000
PYANNOTE_URL=http://localhost:8000  # same container as whisper is fine
OPENAI_API_KEY=

# Phase 8+
RECALL_API_KEY=
RECALL_WEBHOOK_SECRET=

# Phase 11+
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Phase 12+
SENTRY_DSN_API=
SENTRY_DSN_WORKER=
```

---

## 9. Testing strategy (beginner cheat-sheet)

| Layer                          | Tool                      | What to test                                    |
| ------------------------------ | ------------------------- | ----------------------------------------------- |
| Pure services (`*.service.ts`) | Vitest                    | Business rules, edge cases, authz logic.        |
| Repos (`*.repo.ts`)            | Vitest + test DB          | Prisma queries return the right shape.          |
| Routes (`*.route.ts`)          | `fastify.inject`          | Request/response contract + Zod validation.     |
| Worker handlers                | Vitest with mocked queues | Correct stage transitions on success / failure. |
| End-to-end critical flows      | Playwright (from web app) | Signup, upload → summary, invite accept.        |

**Rule:** do not chase 100% coverage. Do chase 100% coverage of **money paths** (uploads, billing, auth, task writes).

---

## 10. Learning roadmap (first-time backend dev)

You do NOT need to read everything before starting — reference each as the phase calls for it.

1. **HTTP & REST fundamentals** → MDN's "An overview of HTTP". 1h.
2. **Fastify docs** → "Getting started" + "Plugins" + "Hooks & lifecycle". Most of what you need is 3 pages.
3. **Prisma** → "Relations" + "Raw database access" (for the vector column).
4. **BullMQ** → "Queues", "Workers", "Flows". You'll reread "Flows" at phase 3.
5. **Zod** → just the docs index; you'll learn by use.
6. **BetterAuth** → "Core concepts" + "Sessions" + "Server-side usage".
7. **Postgres** → Markus Winand's "Use The Index, Luke!" (free) once you hit phase 7.
8. **pgvector** → the README is enough. The blog post "Scaling pgvector to 1M embeddings" is bedtime reading.
9. **BullMQ reliability patterns** → "Patterns: Stalled jobs", "Rate limiting".
10. **Twelve-Factor App** → read once before phase 12.

Pair each phase with ~30 min of reading on the relevant tool. Everything else is pattern-matching from this plan's code templates.

---

## 11. Summary timeline

| Week  | Phase                     | Headline deliverable                                    |
| ----- | ------------------------- | ------------------------------------------------------- |
| 1     | 0 — Foundation cleanup    | Codebase trustworthy; `prisma generate` matches DB.     |
| 2     | 1 — Workspaces            | Multi-tenancy primitive; signup auto-creates workspace. |
| 3     | 2 — Upload skeleton       | Files uploaded via presigned URL, jobs queued.          |
| 4     | 3 — Whisper               | Real transcripts in DB.                                 |
| 5     | 4 — Diarization           | Speaker-tagged conversations.                           |
| 6     | 5 — AI analysis           | Summaries + action items + embeddings.                  |
| 7     | 6 — Meetings & tasks APIs | Web app fully live (no mocks).                          |
| 8     | 7 — Search                | Hybrid semantic + keyword search.                       |
| 9     | 8 — Recall.ai bot         | Bot joins and transcribes calls.                        |
| 10    | 9 — SSE live updates      | Real-time progress without polling.                     |
| 11    | 10 — Calendar             | Upcoming meetings from Google/MS.                       |
| 12    | 11 — Billing              | Usage metering + Stripe checkout.                       |
| 13–14 | 12 — Hardening & deploy   | Tests, CI, observability, Railway deploy.               |

---

## 12. Decision points to flag to yourself

These are choices I'd want you to make consciously, not by default, when you reach them:

1. **Phase 3**: self-host Whisper on a GPU box vs OpenAI's `whisper-1` API. Start with OpenAI ($0.006/min) to ship faster; migrate when costs justify the ops work (probably after 1000 users).
2. **Phase 4**: pyannote locally vs Recall.ai's diarization vs AssemblyAI. If self-hosting gets hairy, paying AssemblyAI ~$0.25/hour is fine for an MVP.
3. **Phase 5**: `gpt-4o-mini` vs `gpt-4o` for summaries — mini is 15× cheaper and fine for most meetings.
4. **Phase 9**: SSE vs WebSockets. SSE is simpler, unidirectional, auto-reconnects. Pick it unless you need bidirectional later.
5. **Phase 12**: Railway vs Fly.io vs Render. Railway is easiest for a first deploy; all three are fine.

---

_Revise this doc at the end of each phase. Mark what shipped, what slipped, and why._
