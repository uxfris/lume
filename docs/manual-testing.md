# Manual testing guide

This document is a **manual QA playbook** for Lume end-to-end. Use it before releases, after large changes, or when validating a local/staging environment.

Automated tests (`pnpm test`) cover isolated logic only. Most product behavior still needs a human in the browser (and sometimes real third-party services).

---

## Table of contents

1. [What you are validating](#what-you-are-validating)
2. [Environments](#environments)
3. [Local setup checklist](#local-setup-checklist)
4. [Credentials matrix](#credentials-matrix)
5. [Test data](#test-data)
6. [Observability while testing](#observability-while-testing)
7. [Meeting lifecycle reference](#meeting-lifecycle-reference)
8. [Pre-flight smoke (5 minutes)](#pre-flight-smoke-5-minutes)
9. [Feature test plans](#feature-test-plans)
10. [Webhook & tunnel testing](#webhook--tunnel-testing)
11. [Regression hotspots](#regression-hotspots)
12. [Release sign-off template](#release-sign-off-template)

---

## What you are validating

Lume is a monorepo with four runtime pieces that must work together for full manual QA:

| Piece | Role in manual testing |
|-------|-------------------------|
| `apps/web` | UI: marketing, auth, dashboard, meetings, settings |
| `apps/api` | REST, auth, webhooks, SSE, Swagger |
| `apps/worker` | Async pipeline (transcribe → diarize → analyze → embed → integrations) |
| `services/whisper` | Local speech-to-text + diarization (upload path only) |

**Two ingestion paths** — test both when possible:

| Path | Trigger | Pipeline |
|------|---------|----------|
| **Upload** | File drop on `/dashboard/uploads` | S3 → `transcribe` → `diarize` → `analyze` → `embed` → `deliver-integrations` |
| **Live Sync (bot)** | Paste meeting URL on dashboard | Recall bot → webhooks → `import-bot-transcript` → `analyze` → `embed` → `deliver-integrations` |

---

## Environments

| Environment | Web | API | Notes |
|-------------|-----|-----|-------|
| **Local** | http://localhost:3000 | http://localhost:3001 | Full control; needs Docker + env files |
| **Staging** | Your Vercel preview / staging URL | Staging Railway API | Match `NEXT_PUBLIC_API_URL` to staging API |
| **Production** | Production domain | Production API | Read-only smoke unless explicitly approved |

Always confirm which API the web app talks to (`NEXT_PUBLIC_API_URL` in `apps/web/.env.local`).

---

## Local setup checklist

Complete this once per machine (or after pulling migrations).

### 1. Install and infrastructure

```bash
pnpm install
docker compose up -d
```

Wait until Postgres (`5432`), Redis (`6379`), and Whisper (`8000`) are healthy. Whisper’s first start can take several minutes while models download.

### 2. Environment files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
```

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See [Credentials matrix](#credentials-matrix) for what must be real vs placeholder.

### 3. Database

```bash
pnpm --filter @workspace/database db:generate
pnpm --filter @workspace/database db:migrate
```

### 4. Run all services

```bash
pnpm dev
```

Or run individually when isolating failures:

```bash
pnpm --filter web dev
pnpm --filter @workspace/api dev
pnpm --filter @workspace/worker dev
```

### 5. Verify health

| Check | URL / command | Expected |
|-------|---------------|----------|
| API | http://localhost:3001/health | 200 OK |
| API docs | http://localhost:3001/docs | Swagger UI loads |
| Worker | http://localhost:9100/health | 200 OK |
| Whisper | http://localhost:8000/health | 200 OK |
| Web | http://localhost:3000 | Marketing home loads |

---

## Credentials matrix

| Capability | Required env (API) | Required env (worker) | Without it |
|------------|------------------|----------------------|------------|
| Sign in (Google) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | — | OAuth fails |
| Sign in (Microsoft) | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | — | OAuth fails |
| Sessions | `BETTER_AUTH_SECRET` (32+ bytes), `AUTH_URL`, `FRONTEND_URL` | — | Auth broken |
| Upload → transcript | `AWS_*`, `S3_BUCKET`, `OPENAI_API_KEY` | Same + `WHISPER_URL`, `PYANNOTE_URL` | Upload stalls or fails |
| Live Sync bot | `RECALL_API_KEY`, `RECALL_WEBHOOK_SECRET` + **public webhook URL** | `RECALL_API_KEY` | Bot dispatch or post-call pipeline fails |
| Calendar upcoming | Recall calendar + Google/Microsoft OAuth with refresh tokens | — | Upcoming sidebar empty |
| Slack delivery | `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` | — | Connect fails |
| Linear issues | `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET` | — | Connect fails |
| Studio Pro billing | `STRIPE_*` + webhook tunnel to `/webhooks/stripe` | `STRIPE_SECRET_KEY` (account deletion) | Checkout 503 or plan never updates |
| Invite email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | — | Invites may not send (check API logs) |
| 2FA SMS | Twilio vars in API `.env` | — | SMS 2FA unavailable |
| pyannote (local) | — | `HF_TOKEN` in root `.env` for Docker | Diarization may fail on worker |

**Starter plan limits** (for quota testing): 300 transcription minutes/month and 5 meetings/month (`packages/types/src/billing.ts`). Studio Pro removes those caps.

---

## Test data

### Fresh user flow

Use a dedicated test Google or Microsoft account (not your personal primary) so OAuth consent and calendar data stay predictable.

1. Sign out of any existing Lume session.
2. Open http://localhost:3000/authentication
3. Complete sign-in → you should land on `/dashboard` with a default workspace.

### Seeded meetings (UI-only bulk data)

`packages/database/prisma/seed.ts` inserts 50 fake meetings for a **hard-coded user id**. Before using it:

1. Sign in once and copy your user id from the database or API.
2. Update `SEED_USER_ID` in `seed.ts` to match.
3. Run:

```bash
pnpm --filter @workspace/database db:seed
```

Meetings are titled `[seed] Meeting …` and mix statuses (`SUMMARIZED`, `TRANSCRIBED`, etc.) for list/filter QA **without** running the worker.

### Sample media for uploads

Keep a small set of fixtures:

| File | Purpose |
|------|---------|
| Short `.mp3` / `.m4a` (~1–3 min) | Fast happy-path upload |
| Longer `.mp4` (~15+ min) | Quota minutes + worker duration |
| Invalid / huge file | Validation and error UX |
| Non-media (e.g. `.pdf` if supported) | Rejection messaging |

---

## Observability while testing

### Bull Board (local only)

When `NODE_ENV !== production`, open http://localhost:3001/admin/queues to inspect queue depth, completed/failed jobs, and retries.

Queues: `transcribe`, `diarize`, `analyze`, `embed`, `import-bot-transcript`, `delete-account`, `deliver-integrations`.

### Logs

- **API** and **worker**: structured JSON in the terminal running `pnpm dev`.
- Search logs for `meetingId`, `workspaceId`, and `traceId` when correlating UI → job → webhook.

### Metrics (optional)

- API: http://localhost:3001/metrics
- Worker: http://localhost:9100/metrics

Useful series: `lume_queue_jobs{queue,state}`, process memory/uptime.

### Browser devtools

- **Network**: API calls to `localhost:3001`, SSE on `GET /meetings/:id/events`.
- **Application → Cookies**: session cookie present after auth.

---

## Meeting lifecycle reference

Database statuses (`MeetingStatus`) and what testers usually see in the UI:

| DB status | Typical UI | Meaning |
|-----------|------------|---------|
| `PENDING_UPLOAD` | Upload in progress | Presign created, file not in S3 yet |
| `UPLOADED` | Queued / early processing | File in S3, `transcribe` pending or running |
| `TRANSCRIBING` | Transcribing… | Whisper running |
| `TRANSCRIBED` | Transcribing… / Analyzing… | Diarization done or bot transcript imported |
| `ANALYZING` | Generating summary… | OpenAI analysis |
| `SUMMARIZED` | Full meeting document | Done (search embeddings may still be running) |
| `FAILED` | Error state | Check worker logs + Bull Board failed job |
| `SCHEDULED` | Bot scheduled | Future Live Sync / calendar bot |
| `LIVE` | Live indicator on dashboard | Bot in call |

SSE (`GET /meetings/:id/events`) drives live progress on uploads and meeting pages without full page reload.

---

## Pre-flight smoke (5 minutes)

Run before deep feature testing.

- [ ] `pnpm typecheck` and `pnpm lint` pass (optional but catches broken builds)
- [ ] All health endpoints return 200
- [ ] Sign in with one OAuth provider succeeds
- [ ] Dashboard loads: Live Sync card, recent meetings, upcoming sidebar (may be empty)
- [ ] Open Swagger at http://localhost:3001/docs — authenticated routes return 401 without session (expected)

---

## Feature test plans

Use checkboxes per release. **Pass** = matches expected UX with no console errors or stuck states > reasonable time (see timeouts below).

**Suggested timeouts (local):**

| Step | Rough max wait |
|------|----------------|
| Short audio upload → `SUMMARIZED` | 5–15 min (Whisper + OpenAI) |
| Bot meeting → `SUMMARIZED` | Depends on call length + Recall |
| Search after summarize | 1–2 min after `SUMMARIZED` |

---

### A. Marketing site (unauthenticated)

| # | Steps | Expected |
|---|--------|----------|
| A1 | Visit `/`, `/product`, `/pricing`, `/integrations`, `/security` | Pages render; links work; no auth required |
| A2 | Visit `/privacy`, `/term` | Legal content renders |
| A3 | Click primary CTAs (Sign in / Start free) | Navigate to `/authentication` |
| A4 | Resize to mobile width | Layout readable; nav usable |

---

### B. Authentication

| # | Steps | Expected |
|---|--------|----------|
| B1 | Open `/authentication` while logged out | Google, Microsoft, Email options visible |
| B2 | Sign in with **Google** | Redirect back; land on `/dashboard`; session persists on refresh |
| B3 | Sign in with **Microsoft** (separate account) | Same as B2 |
| B4 | Sign in with **Email** (if enabled in Better Auth) | Magic link / OTP flow completes |
| B5 | Terms checkbox required when shown | Cannot proceed without accepting |
| B6 | Visit `/authentication?next=/dashboard/tasks` while logged out; sign in | Redirect to `/dashboard/tasks` |
| B7 | Sign out from settings | Session cleared; protected routes redirect to auth |

**OAuth app setup:** redirect URIs must include Better Auth callback URLs for your API host (see Better Auth docs / `apps/api` auth plugin at `/api/auth/*`).

---

### C. Workspace bootstrap & switching

| # | Steps | Expected |
|---|--------|----------|
| C1 | First login | Personal/default workspace exists; meetings scoped to it |
| C2 | If multi-workspace UI exists in shell | Switching workspace changes meeting lists and settings context |

---

### D. Dashboard home (`/dashboard`)

| # | Steps | Expected |
|---|--------|----------|
| D1 | Load dashboard | Live Sync, recent meetings, upcoming (desktop sidebar / mobile block) |
| D2 | **Live Sync** — paste valid Google Meet / Zoom / Teams URL → Join Now | Join dialog opens; confirm dispatch |
| D3 | Complete bot join | Success dialog; meeting appears in recent/live with `LIVE` or processing state |
| D4 | Invalid URL (random text) | Inline validation error |
| D5 | Unsupported platform URL | API 422 or clear error in dialog |
| D6 | Live meeting card (if any) | Shows in-progress state; opens meeting when clicked |

---

### E. File upload (`/dashboard/uploads`)

| # | Steps | Expected |
|---|--------|----------|
| E1 | Upload short audio file | Progress UI; meeting row appears in recent uploads |
| E2 | Watch status through SSE | States advance: transcribing → analyzing → processed |
| E3 | Open meeting when processed | Summary, transcript, action items visible |
| E4 | Upload second file while first runs | Both tracked independently |
| E5 | **Fetch from link** (if enabled in UI) | Server fetches URL, queues pipeline (feature may be commented out in UI — verify in Swagger `POST /uploads/from-url`) |
| E6 | Cancel / fail case: network offline mid-upload | Sensible error; no orphan “stuck forever” without refresh |

---

### F. Meeting document (`/meeting/[id]`)

| # | Steps | Expected |
|---|--------|----------|
| F1 | Open processed meeting | Overview / takeaways / action items render |
| F2 | Transcript tab | Speaker labels; scroll and search within transcript |
| F3 | TipTap editor | Edit summary content; changes persist after reload |
| F4 | Media player (if audio available) | Playback works; sync with transcript if implemented |
| F5 | Star meeting from list or detail | Appears under `/dashboard/starred` |
| F6 | Meeting still processing | Loading state with “Transcribing…” / “Generating summary…” |
| F7 | Failed meeting | Error messaging; no infinite spinner |

---

### G. Meeting lists & filters

Routes: `/dashboard/meetings`, `/dashboard/created-by-me`, `/dashboard/shared-with-me`, `/dashboard/starred`, `/dashboard/meetings/channel/[id]` (if channels used).

| # | Steps | Expected |
|---|--------|----------|
| G1 | List loads with pagination / infinite scroll | Older meetings load; no duplicate rows |
| G2 | Search/filter toolbar (time, source, platform, etc.) | Results match filters |
| G3 | Empty states | Correct copy for starred / created / shared |
| G4 | Row actions menu | Open, share, delete (if exposed), star |

---

### H. Global search (⌘K / sidebar)

| # | Steps | Expected |
|---|--------|----------|
| H1 | Open search dialog from dashboard nav | Modal opens |
| H2 | Query keyword from a known meeting title | Meeting appears in results |
| H3 | Semantic query (concept in summary, not title) | Relevant meeting returned after embeddings complete |
| H4 | Click result | Navigates to correct `/meeting/[id]` |

---

### I. Sharing & access control

| # | Steps | Expected |
|---|--------|----------|
| I1 | Open Share dialog on owned meeting | Collaborators list; invite by email |
| I2 | Set general access: Restricted → Workspace → Link | Non-members blocked or allowed per setting |
| I3 | Invite collaborator as Viewer | They see meeting; cannot edit (if EDITOR vs VIEWER enforced) |
| I4 | Invite collaborator as Editor | Can edit document |
| I5 | Second user: `/dashboard/shared-with-me` | Shared meeting listed |
| I6 | Copy link (when link sharing on) | Opens in incognito / other browser per policy |

Test with **two browsers** (or normal + incognito) and two accounts in the same workspace where needed.

---

### J. Tasks (`/dashboard/tasks`)

| # | Steps | Expected |
|---|--------|----------|
| J1 | Tabs: All / Mine / etc. (per UI) | Tasks grouped by meeting |
| J2 | Mark complete / reopen | State persists |
| J3 | Assignee selection | Workspace members available |
| J4 | **Send to Linear** (if connected) | Issue created in chosen team; error toast on failure |
| J5 | Productivity / AI insight panels | Load without error (may be empty on new workspace) |

---

### K. Integrations

Hub: `/dashboard/integrations`. Live providers: **Slack**, **Linear**.

| # | Steps | Expected |
|---|--------|----------|
| K1 | List page | Slack + Linear show connected/disconnected state |
| K2 | Connect Slack | OAuth → redirect with `?oauth=success`; toast success |
| K3 | Slack settings | Pick default channel; toggle auto-post summary |
| K4 | Connect Linear | OAuth success; pick default team |
| K5 | Disconnect each | Status returns to disconnected; tokens cleared |
| K6 | OAuth failure | `?oauth=error` shows error toast |
| K7 | After processed meeting with integrations on | Slack message posted; Linear issues for action items (check Bull `deliver-integrations` job) |

OAuth redirect URLs must point to API integration callback routes and back to `FRONTEND_URL/dashboard/integrations/...`.

---

### L. Calendar & upcoming meetings

| # | Steps | Expected |
|---|--------|----------|
| L1 | Connect calendar (Google or Microsoft via Recall Calendar V2) | `POST /calendar/connect` succeeds (may need prior OAuth with calendar scopes) |
| L2 | Dashboard upcoming sidebar | Events grouped by day; platform icons |
| L3 | Open event external link | Opens Google/Outlook calendar |
| L4 | Auto-join setting (if exposed in UI) | Setting saves |
| L5 | Schedule bot for future event (if supported) | Meeting `SCHEDULED`; bot joins at start |

Calendar webhooks require the same **public HTTPS tunnel** as Recall (see below).

---

### M. Workspace settings (`/settings/workspace`)

| # | Steps | Expected |
|---|--------|----------|
| M1 | Change workspace name | Persists after reload |
| M2 | Change handle/slug (if editable) | Validation on duplicates |
| M3 | Upload workspace avatar | Image displays |
| M4 | Leave workspace (non-owner) | Membership removed; redirect |
| M5 | Owner cannot leave without transfer (if enforced) | Clear error |

---

### N. People & invites (`/settings/people`)

| # | Steps | Expected |
|---|--------|----------|
| N1 | Invite member by email | Invitation sent (check inbox or Resend logs) |
| N2 | Invite link copy / regenerate | New user opens `/invite/[token]` and joins workspace |
| N3 | Accept invite (second account) | Member role applied; access to workspace data |
| N4 | Change member role Admin ↔ Member | Permissions update (admin-only actions) |
| N5 | Remove member | User loses access |
| N6 | Bulk actions / export CSV | Works on selected rows |
| N7 | Pending invitations tab | Revoke invitation |

---

### O. Account settings (`/settings/account`)

| # | Steps | Expected |
|---|--------|----------|
| O1 | Update display name | Persists |
| O2 | Avatar upload | Image updates |
| O3 | Notification preferences | Toggles save |
| O4 | Enable 2FA (TOTP or SMS per UI) | Login requires second factor |
| O5 | Disable 2FA | Reverts to single factor |
| O6 | Schedule account deletion | Banner with grace date (7 days) |
| O7 | Cancel scheduled deletion | Banner removed |
| O8 | After grace (staging only / accelerated job) | Account data removed; Stripe subs cancelled on owned workspaces |

---

### P. Billing (`/settings/billing`)

Use **Stripe test mode** only.

| # | Steps | Expected |
|---|--------|----------|
| P1 | View usage on Starter | Minutes and meeting count vs limits (300 min / 5 meetings) |
| P2 | Hit quota (upload or bot until blocked) | 402-style UX; upgrade dialog |
| P3 | Start Studio Pro checkout | Redirect to Stripe Checkout; test card `4242…` |
| P4 | Complete checkout webhook | Workspace plan updates to Pro; limits removed |
| P5 | Billing portal | Manage subscription opens Stripe portal |
| P6 | Cancel subscription in Stripe | Webhook downgrades workspace |

Local webhook testing: `stripe listen --forward-to localhost:3001/webhooks/stripe` and set `STRIPE_WEBHOOK_SECRET` from CLI output.

---

### Q. Notifications

| # | Steps | Expected |
|---|--------|----------|
| Q1 | In-app notification bell (if present) | Meeting summary ready notification after processing |
| Q2 | Email share / invite (Resend) | Received with correct links |

---

### R. API & security spot checks

| # | Steps | Expected |
|---|--------|----------|
| R1 | Call protected route without cookie | 401 |
| R2 | Access another workspace’s meeting id | 404 (no leak) |
| R3 | Rate limit: rapid presign uploads | 429 after threshold (20/min per user) |
| R4 | Recall webhook with bad signature | 401/403; no state change |
| R5 | Stripe webhook with bad signature | Rejected |

Use Swagger or `curl` with session cookie from browser.

---

### S. Worker failure modes (manual simulation)

| # | Steps | Expected |
|---|--------|----------|
| S1 | Stop worker; upload file | Meeting stuck mid-status; jobs visible in Bull Board |
| S2 | Restart worker | Jobs resume; meeting completes |
| S3 | Stop Whisper; upload | `TRANSCRIBING` fails → `FAILED` or retry per job options |
| S4 | Invalid `OPENAI_API_KEY` | `analyze` fails; failed job in queue |

See runbooks: [`docs/runbooks/`](./runbooks/).

---

## Webhook & tunnel testing

Recall and Stripe **cannot** call `localhost` directly. Use a tunnel:

```bash
# Example with Cloudflare
cloudflared tunnel --url http://localhost:3001

# Or ngrok
ngrok http 3001
```

Configure:

| Service | Endpoint | Dashboard setting |
|---------|----------|-------------------|
| Recall | `https://<tunnel>/webhooks/recall` | Recall webhook URL + `RECALL_WEBHOOK_SECRET` |
| Recall realtime (optional) | `https://<tunnel>/webhooks/recall/realtime` | `RECALL_REALTIME_WEBHOOK_URL` |
| Stripe | `https://<tunnel>/webhooks/stripe` | Stripe CLI or dashboard |

After changing secrets, restart API.

**Verify:** trigger a test event (Recall dashboard or end a bot call; Stripe CLI `trigger`) and confirm API logs show handled events, not signature rejections.

---

## Regression hotspots

Prioritize these when time is limited:

1. **Upload → SSE → meeting document** (money path)
2. **Live Sync bot → webhook → import transcript → summary**
3. **Auth session + workspace scoping** on all list endpoints
4. **Sharing** (workspace vs link vs collaborator roles)
5. **Starter quota** and **Studio Pro upgrade** webhook
6. **Slack/Linear OAuth** callback query params
7. **Prisma migrations** applied (`db:migrate`) before testing new features
8. **Invite accept** flow with fresh user

---

## Release sign-off template

Copy for PR or release notes:

```markdown
## Manual QA — [version / PR / date]

**Environment:** Local / Staging / Production  
**Tester:**  
**API URL:**  
**Commit:**

### Smoke
- [ ] Health checks
- [ ] Auth (Google / Microsoft)
- [ ] Upload → summarized meeting
- [ ] Live Sync bot (if Recall configured)

### Features touched
- [ ] …

### Integrations
- [ ] Slack
- [ ] Linear
- [ ] Stripe billing
- [ ] Calendar

### Known issues / not tested
- …

**Result:** Pass / Pass with exceptions / Fail
```

---

## Related docs

| Doc | Use when |
|-----|----------|
| [README.md](../README.md) | Install, scripts, architecture |
| [deployment.md](./deployment.md) | Staging/production URLs and secrets |
| [backend-plan.md](./backend-plan.md) | Pipeline phases and planned integration tests |
| [runbooks/](./runbooks/) | Incidents during manual runs (worker stuck, OpenAI, Whisper OOM) |

---

## Gaps (automated coverage not replaced by this guide)

The following are **planned** but not fully covered by manual scripts in-repo:

- Playwright E2E (signup → upload → summary) — not present in `apps/web` yet
- API integration tests with a disposable test database
- Formal load testing

Track progress in [backend-plan.md](./backend-plan.md) §9 and §12.

When those land, keep this document focused on **exploratory**, **UX**, and **third-party** behavior that automation still misses (OAuth consent screens, real meeting platforms, Slack/Linear side effects).
