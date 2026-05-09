# Worker is stuck

**Severity:** SEV-2 (user-visible — meetings never finish processing) **Owner:** Backend on-call

## Detect

- **Sentry**: no `lume-worker` events for >10 minutes during business hours.
- **`/metrics`** (worker, port 9100): `lume_queue_jobs{state="active"}` is non-zero
  for one of `transcribe|diarize|analyze|embed|import-bot-transcript`, and the same job
  has been active for >5 min (BullMQ default lock duration is 30s; jobs older
  than that = the worker died mid-job).
- **Bull Board** (`/admin/queues` in dev, blocked in prod): "Active" tab shows
  jobs with `processedOn` >5 min ago.
- **User report**: "My meeting has been processing for ten minutes."

## Mitigate (do this first)

1. **Restart the worker** on Railway:
   `railway redeploy --service lume-worker`
   BullMQ locks expire automatically; jobs requeue once the new worker boots.
2. If a single meeting keeps re-failing on every attempt, **manually mark it
   FAILED** to unblock the user:

   ```sql
   UPDATE "Meeting"
      SET status = 'FAILED'
    WHERE id = '<meetingId>';
   INSERT INTO "ProcessingEvent" (id, "meetingId", stage, message)
   VALUES (gen_random_uuid(), '<meetingId>', 'FAILED', 'Manually failed by oncall — see runbook worker-stuck');
   ```

3. Tell the user (Slack / email) so they don't keep refreshing.

## Investigate

1. Check **Sentry → lume-worker** for unhandled exceptions in the last hour.
2. Check **Whisper** (`docker logs lume-whisper` or Railway logs) for OOM /
   model-load failures — see [whisper-oom.md](./whisper-oom.md).
3. Check **Redis** is reachable: `redis-cli -u $REDIS_URL ping`. If Redis was
   down, BullMQ will have dropped lock heartbeats; the worker will recover on
   reconnect, but inflight jobs may be stuck.
4. Check **DB** for a slow query that's holding a row lock.

## Recover

- Jobs stuck in `active` for >2× lock duration are auto-recovered to `waiting`
  by BullMQ once a worker comes online.
- For meetings that hit `attempts: 2` and ended up in `failed`, the user can
  re-upload — we don't auto-retry expensive Whisper jobs.

## Follow-up

- [ ] Postmortem if user-visible >10 min.
- [ ] Add an alert: `lume_queue_jobs{state="active"} > 0` for >5 min.
- [ ] If pattern is "worker silently exited", add a `process.on('uncaughtException')` Sentry breadcrumb in `apps/worker/src/index.ts`.
