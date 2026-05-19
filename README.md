# Lume

Meeting intelligence for teams — record calls, transcribe with speaker labels, summarize with AI, extract action items, and search across your workspace.

Built as a **pnpm + Turborepo** monorepo: a Next.js app, a Fastify API, a BullMQ worker, and a self-hosted Whisper/pyannote service.

## Features

- **Live Sync** — Paste a Zoom, Google Meet, or Teams link; a Recall.ai bot joins and captures the call.
- **Uploads** — Drop audio/video files for the same transcript → summary → tasks pipeline.
- **Meeting documents** — Structured overview, key takeaways, and speaker-aware transcripts (TipTap editor).
- **Action items** — Extract tasks from conversations; sync to Linear with meeting context.
- **Semantic search** — Keyword and vector search across workspace meetings (pgvector).
- **Workspaces** — Multi-tenant teams with roles, invites, channels, and sharing.
- **Integrations** — Slack delivery, Linear issues, Google/Microsoft OAuth, Stripe billing (Studio Pro).

## Architecture

```mermaid
flowchart TB
  subgraph clients
    Web["apps/web<br/>Next.js"]
  end

  subgraph backend
    API["apps/api<br/>Fastify"]
    Worker["apps/worker<br/>BullMQ"]
  end

  subgraph data
    PG[("PostgreSQL 16<br/>+ pgvector")]
    Redis[("Redis")]
    S3[("AWS S3")]
  end

  subgraph ml
    Whisper["services/whisper<br/>Whisper + pyannote"]
    OpenAI["OpenAI API"]
    Recall["Recall.ai"]
  end

  Web -->|REST| API
  API -->|enqueue jobs| Redis
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

**Upload pipeline:** presigned S3 URL → `transcribe` → Whisper → `diarize` → pyannote → merge → `analyze` → OpenAI → `embed` → pgvector.

**Bot pipeline:** Recall bot records the call → webhook → S3 or `import-bot-transcript` → `analyze` → same downstream steps.

## Repository layout

```
lume/
├── apps/
│   ├── web/          # Next.js 16 frontend (marketing + app)
│   ├── api/          # Fastify REST API, webhooks, auth
│   └── worker/       # BullMQ job processors
├── packages/
│   ├── database/     # Prisma schema + client
│   ├── queue/        # Queue names and job types
│   ├── ui/           # Shared shadcn/ui components
│   ├── auth/         # Better Auth configuration
│   ├── api-client/   # Typed API client for the web app
│   └── …             # eslint-config, types, account-deletion, etc.
├── services/
│   └── whisper/      # FastAPI: speech-to-text + diarization
├── docs/             # Deployment guide, runbooks, project brief
└── docker-compose.yml
```

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | 9.15.9 (`packageManager` in root `package.json`) |
| Docker | For Postgres, Redis, and Whisper locally |

Optional for full functionality: AWS S3 credentials, OpenAI API key, OAuth app credentials (Google/Microsoft), Recall.ai, Stripe, Resend, Slack/Linear OAuth, Twilio (2FA SMS).

## Quick start

### 1. Clone and install

```bash
git clone <repo-url> lume && cd lume
pnpm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts **Postgres** (`pgvector/pg16` on `5432`), **Redis** (`6379`), and **Whisper** (`8000`). The Whisper image downloads models on first run; set `HF_TOKEN` in `.env` if pyannote requires it.

### 3. Configure environment

Copy the example env files and fill in values:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
```

**Minimum local values** (everything else can be dummy strings for bootstrapping UI-only work; transcription needs OpenAI + S3):

| Variable | Example | Used by |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://lume:lume@localhost:5432/lume` | api, worker |
| `REDIS_URL` | `redis://localhost:6379` | api, worker |
| `APP_URL` | `http://localhost:3000` | api |
| `API_URL` | `http://localhost:3001` | api |
| `AUTH_URL` | `http://localhost:3001` | api |
| `FRONTEND_URL` | `http://localhost:3000` | api, worker |
| `BETTER_AUTH_SECRET` | 32+ random bytes | api |
| `GOOGLE_CLIENT_ID` / `SECRET` | from Google Cloud Console | api |
| `MICROSOFT_CLIENT_ID` / `SECRET` | from Azure AD | api |
| `AWS_*`, `S3_BUCKET`, `S3_BASE_URL` | dev bucket | api, worker |
| `OPENAI_API_KEY` | sk-… | api, worker |
| `WHISPER_URL` | `http://localhost:8000` | worker |
| `PYANNOTE_URL` | `http://localhost:8000` | worker |

For the web app, set in `apps/web/.env.local` (create if missing):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See [`apps/api/.env.example`](apps/api/.env.example) and [`apps/worker/.env.example`](apps/worker/.env.example) for the full list including Recall, Stripe, Resend, Slack, Linear, Sentry, and Twilio.

### 4. Database

```bash
pnpm --filter @workspace/database db:generate
pnpm --filter @workspace/database db:migrate
```

### 5. Run development servers

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| API docs (Swagger) | http://localhost:3001/docs |
| API health | http://localhost:3001/health |
| Worker health | http://localhost:9100/health |
| Whisper | http://localhost:8000/health |

Run individual apps when debugging:

```bash
pnpm --filter web dev
pnpm --filter @workspace/api dev
pnpm --filter @workspace/worker dev
```

## Scripts

Root commands (via Turborepo):

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all `dev` tasks (web, api, worker) |
| `pnpm build` | Production build for all packages |
| `pnpm typecheck` | TypeScript across the monorepo |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (api, worker, queue, etc.) |
| `pnpm format` | Prettier |

Database (`@workspace/database`):

| Command | Description |
|---------|-------------|
| `pnpm --filter @workspace/database db:generate` | Generate Prisma client |
| `pnpm --filter @workspace/database db:migrate` | Apply migrations in dev |
| `pnpm --filter @workspace/database db:deploy` | Apply migrations in CI/prod |
| `pnpm --filter @workspace/database db:seed` | Seed data (if configured) |

## Background jobs

Queues are defined in [`packages/queue/src/jobs.ts`](packages/queue/src/jobs.ts):

| Queue | Purpose |
|-------|---------|
| `transcribe` | Speech-to-text via Whisper |
| `diarize` | Speaker diarization via pyannote |
| `analyze` | LLM summary, action items, sentiment |
| `embed` | Vector embeddings for search |
| `import-bot-transcript` | Recall transcript import (skips Whisper) |
| `deliver-integrations` | Post-meeting Slack / Linear delivery |
| `delete-account` | Scheduled account deletion sweeper |

## UI components

Shared components live in `packages/ui`. Add shadcn primitives to the web app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Import in the web app:

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Testing

```bash
pnpm test
```

CI (`.github/workflows/ci.yml`) runs on every push/PR to `main`:

- Install → Prisma generate → typecheck → lint → test
- **Schema drift** job: applies migrations to Postgres and fails if `schema.prisma` is out of sync with migration history

## Deployment

Production runs as **four independently scaled services**:

| Service | Platform | Health |
|---------|----------|--------|
| `apps/web` | Vercel | `/` |
| `apps/api` | Railway | `/health`, `/metrics` |
| `apps/worker` | Railway | `/health` (port 9100), `/metrics` |
| `services/whisper` | Railway GPU or Hetzner | `/health` |
| Postgres + pgvector | Neon or Railway | — |
| Redis | Upstash or Railway | — |
| Object storage | AWS S3 | — |

Full checklist, secret rotation, and observability: **[`docs/deployment.md`](docs/deployment.md)**.

Incident playbooks: **[`docs/runbooks/`](docs/runbooks/)**.

## Observability

- **Logs** — Structured JSON (pino) on api and worker.
- **Metrics** — Prometheus format at `/metrics` (api:3001, worker:9100). Key series: `lume_queue_jobs`, `lume_process_resident_memory_bytes`.
- **Errors** — Sentry (`SENTRY_DSN_API`, `SENTRY_DSN_WORKER`). Set `GIT_SHA` per deploy for release tracking.

## Documentation

| Doc | Description |
|-----|-------------|
| [`docs/project-brief.md`](docs/project-brief.md) | Product context, stack rationale, pipeline flows |
| [`docs/deployment.md`](docs/deployment.md) | Production deploy checklist |
| [`docs/runbooks/`](docs/runbooks/) | On-call playbooks (worker stuck, OpenAI outage, Whisper OOM) |
| [`docs/backend-plan.md`](docs/backend-plan.md) | Backend implementation notes |

## Security

Report vulnerabilities to **security@lume.ai**. Do not open public issues for security-sensitive findings.

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TanStack Query, TipTap |
| API | Fastify 5, Zod, Better Auth, OpenAPI/Swagger |
| Worker | BullMQ, Node.js |
| Database | PostgreSQL 16, Prisma, pgvector, pg_trgm |
| AI/ML | faster-whisper, pyannote, OpenAI |
| Infra | Docker Compose (local), Vercel, Railway, AWS S3 |
