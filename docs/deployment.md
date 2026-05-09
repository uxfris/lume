# Deployment

Lume is deployed as four independent services so they can scale separately.

| Service                | Platform                             | Health URL              | Notes                                             |
| ---------------------- | ------------------------------------ | ----------------------- | ------------------------------------------------- |
| `apps/web` (Next.js)   | Vercel                               | `/`                     | Edge runtime; CSP headers in `next.config.mjs`.   |
| `apps/api` (Fastify)   | Railway (`apps/api/railway.json`)    | `/health`               | Uses `pnpm` Nixpacks; Helmet on; `/metrics` open. |
| `apps/worker` (BullMQ) | Railway (`apps/worker/railway.json`) | `/health` (port 9100)   | `restartPolicyType: ALWAYS`; tiny embedded http.  |
| `services/whisper`     | Railway GPU plan or Hetzner          | `/health`               | Dockerfile build; honors `$PORT`.                 |
| Postgres + pgvector    | Neon **or** Railway                  | n/a                     | Same connection string in api + worker.           |
| Redis                  | Upstash **or** Railway               | n/a                     | TLS connection string for both.                   |
| S3                     | AWS                                  | n/a                     | Presigned URLs are flaky on R2/MinIO — stay on S3.|

## First-time deploy checklist

1. **Provision data plane**:
   - Postgres on Neon / Railway. Run `pnpm --filter @workspace/database db:deploy` once.
   - Redis on Upstash / Railway.
   - S3 bucket per environment (`lume-prod`, `lume-staging`, `lume-dev`).
2. **Create Railway services** (one per `railway.json` file). Wire env vars from `apps/api/.env.example` + `apps/worker/.env.example`.
3. **Set `GIT_SHA`** to `${RAILWAY_GIT_COMMIT_SHA}` so Sentry tags releases.
4. **Sentry projects**:
   - `lume-api` → `SENTRY_DSN_API`.
   - `lume-worker` → `SENTRY_DSN_WORKER`.
   - DSNs created via the Sentry dashboard or MCP server (already populated for the `commit-coffee` org).
5. **Stripe** webhooks → `https://<api>/webhooks/stripe`. **Recall.ai** webhooks → `https://<api>/webhooks/recall`.
6. **Vercel** → connect `apps/web`. Set `NEXT_PUBLIC_API_URL=https://api.lume…`.

## Rotating secrets

- **`BETTER_AUTH_SECRET`**: rolling rotation forces every session to re-login. Plan downtime.
- **`STRIPE_WEBHOOK_SECRET`**: rotate via Stripe dashboard, deploy, expire old endpoint. Webhook events arrive at both during the overlap.
- **`RECALL_WEBHOOK_SECRET`**: same pattern.

## Observability

- Logs: structured JSON (pino) → Railway log drain → Better Stack / Axiom.
- Metrics: scrape `/metrics` on api (3001) and worker (9100). Promised metrics:
  `lume_queue_jobs{queue,state}`, `lume_process_resident_memory_bytes`, `lume_process_uptime_seconds`.
- Errors: Sentry. Failed BullMQ jobs are auto-reported with the queue name as a tag.

## Runbooks

See [`runbooks/`](./runbooks/) for incident playbooks (worker stuck, OpenAI outage, Whisper OOM).
