# Lume Runbooks

One-pager incident playbooks. Each file describes:

1. How to detect the failure mode (Sentry / metrics / user reports).
2. The minimum viable mitigation (the 80% fix you do first).
3. Root-cause investigation steps.
4. Postmortem follow-ups.

| Runbook                                | Symptom                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| [worker-stuck.md](./worker-stuck.md)   | Meetings stuck at `UPLOADED` / `TRANSCRIBED` for >5 min. |
| [openai-outage.md](./openai-outage.md) | `analyze` jobs failing with 5xx from OpenAI.             |
| [whisper-oom.md](./whisper-oom.md)     | Whisper container OOM-kills mid-transcribe.              |

---

When you write a new runbook, copy [`_template.md`](./_template.md). Keep
it under one screen — anyone on call should be able to act on it inside
five minutes.
