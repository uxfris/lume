# Whisper OOM / out-of-memory crash

**Severity:** SEV-2 (every transcribe job fails) **Owner:** Backend on-call

## Detect

- **Railway** (or Hetzner GPU box) shows the `lume-whisper` service in a
  crash loop, exit code 137 (OOM-kill).
- **Worker logs**: `transcribe` jobs failing with
  `ECONNREFUSED <WHISPER_URL>` or 502.
- **Sentry**: spike in `WhisperError` from `apps/worker`, tag `queue:transcribe`.
- **`/health` on whisper service**: returns nothing or 5xx.

Phase 3 gotcha: a `medium` model in `faster-whisper` needs ~5 GB RAM.

## Mitigate (do this first)

1. **Drop to a smaller model** without redeploying code by setting an env
   override on the Whisper service:

   ```bash
   railway variables --service lume-whisper set WHISPER_MODEL_SIZE=small WHISPER_COMPUTE_TYPE=int8
   railway redeploy --service lume-whisper
   ```

   `small + int8` fits in <2 GB. Quality drops a notch; users keep getting
   transcripts.

2. While Whisper is unavailable, **pause the `transcribe` queue** so the
   user-facing pipeline doesn't burn retries:

   ```bash
   redis-cli -u $REDIS_URL HSET bull:transcribe:meta paused 1
   ```

## Investigate

1. Confirm OOM, not segfault: Railway → Metrics → Memory; or
   `dmesg | grep -i kill` on a Hetzner box.
2. Check whether one specific upload triggered it (very long file, or video
   with weird codec). Pull recent `transcribe` job ids from Bull Board,
   query `Upload` table for `fileSize` outliers.
3. Confirm whether pyannote loaded too — pyannote Pipeline pinned in memory
   doubles the RAM cost. If we see OOM only when both Whisper *and* pyannote
   are loaded, plan to split the services.

## Recover

1. Resume the queue:
   `redis-cli -u $REDIS_URL HDEL bull:transcribe:meta paused`
2. Failed jobs over `removeOnFail.age = 7d` are still in Bull Board → "Failed".
   Bulk-retry once Whisper is healthy.

## Follow-up

- [ ] Move Whisper to a box with at least 6 GB RAM (`medium` headroom) or a
      GPU instance — see `docs/backend-plan.md` §7 Decision Points.
- [ ] Add a per-file `durationSeconds` cap on `POST /uploads/presign` — reject
      uploads >2h on Starter plan. Update `requireQuota` middleware.
- [ ] Add a Sentry alert: `WhisperError` count > 10/5min triggers PagerDuty.
