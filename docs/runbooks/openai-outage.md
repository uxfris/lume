# OpenAI outage / rate-limited

**Severity:** SEV-3 (degraded — meetings transcribe but no summary/embeddings) **Owner:** Backend on-call

## Detect

- **Sentry**: spike in `OpenAI` errors from `apps/worker` (handler tags
  `queue:analyze` or `queue:embed`).
- **status.openai.com** shows incident.
- **`/metrics`**: `lume_queue_jobs{queue="analyze",state="failed"}` rising.
- **User report**: "Transcript is there but no summary."

## Mitigate (do this first)

1. **Confirm scope**: open <https://status.openai.com>. If they're down,
   nothing on our side will fix it.
2. **Pause the analyze + embed queues** to stop burning retries against a
   broken upstream:

   ```bash
   redis-cli -u $REDIS_URL <<'EOF'
   HSET bull:analyze:meta paused 1
   HSET bull:embed:meta paused 1
   EOF
   ```

   Or via Bull Board: `/admin/queues` → Analyze → "Pause".
3. Tell users (banner) that "AI summaries are temporarily delayed; transcripts are unaffected." Phase 5 already enqueues `analyze` after `transcribe`, and Phase 6 surfaces partial meetings to the UI, so the only visible degradation is missing summary + tasks.

## Investigate

1. If our error rate is >10× OpenAI's reported rate, we may be hitting a
   per-key tier cap — check the OpenAI dashboard `Usage`.
2. If the issue is rate-limit (429) only on our side, the `p-limit(5)` in the
   `analyze` worker may need tightening, or we need a separate API key.
3. Check `Meeting.summary` for partial JSON: if the LLM responded with
   garbage, our handler should mark `FAILED` (Phase 5 gotcha) — verify in
   Sentry that the exception type is `ZodError`, not a network error.

## Recover

1. Once OpenAI is healthy, **resume the queues**:

   ```bash
   redis-cli -u $REDIS_URL <<'EOF'
   HDEL bull:analyze:meta paused
   HDEL bull:embed:meta paused
   EOF
   ```

   or click "Resume" in Bull Board.
2. Failed jobs over the last N hours (default `removeOnFail.age = 7d`) can be
   re-enqueued in bulk: in Bull Board → Failed → "Retry all".

## Follow-up

- [ ] Add a fallback: if `gpt-4o-mini` 5xx for >3 min, queue jobs against
      `gpt-4o` automatically (degraded but live).
- [ ] Track per-meeting OpenAI cost in `ProcessingEvent.metadata.cost_usd`
      (Phase 5 gotcha) — required input for billing alerts.
- [ ] Open a postmortem if the outage was >30 min user-facing.
