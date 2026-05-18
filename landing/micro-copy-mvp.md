# Lume — MVP Micro-copy

Ready-to-ship strings for the MVP marketing tier. **Primary** = recommended default; **Alt** = A/B or tone variants.

Align limits with `packages/types/src/pricing.ts` and live billing before launch.

---

## Global patterns

### CTAs

| Context | Primary | Alt |
|---------|---------|-----|
| Primary signup | Start free | Get started free |
| Secondary explore | See how it works | Watch the product |
| Pricing — Starter | Start on Starter | Create free account |
| Pricing — Pro | Upgrade to Studio Pro | Go Pro |
| Pricing — Business | Book a demo | Talk to sales |
| Integrations | Sign up to connect | Start free, then connect |
| Post-read | Try Lume on your next meeting | Paste a meeting link |

### Reassurance (near CTAs)

- No credit card required
- Free on Starter — 5 meetings/month
- Works with Zoom, Google Meet, and Microsoft Teams
- Cancel anytime

### Nav & footer

**Header nav:** Product · Integrations · Pricing

**Header actions:** Sign in · **Start free**

**Footer column — Product**  
Product · Integrations · Pricing · Security

**Footer column — Legal**  
Privacy · Terms

**Footer column — Company** (optional MVP)  
Contact · Changelog (hidden until live)

**Footer tagline**  
Meeting intelligence for small teams.

**Copyright**  
© {year} Lume. All rights reserved.

### Status badges

| Badge | Copy |
|-------|------|
| Live integration | Available |
| Roadmap | Coming soon |
| Plan highlight | Most popular |
| Current plan (app) | Current plan |

### Empty / edge (marketing)

| State | Copy |
|-------|------|
| Logo bar (no customers) | Works with the calls you already have |
| Social proof placeholder | Built for startup teams who live in meetings |

---

## Home (`/`)

### Meta

- **Title:** Lume — Meeting notes, action items, and search for small teams
- **Description:** Join Zoom, Meet, or Teams calls with Lume. Get transcripts, AI summaries, and tasks synced to Linear and Slack. Start free.
- **OG title:** Your meetings, remembered.
- **OG description:** Modern meeting intelligence. Free to start.

### Hero

- **Eyebrow:** Meeting intelligence
- **Headline (primary):** Never re-watch a meeting to remember what was decided.
- **Headline (alt A):** From call to clarity in minutes.
- **Headline (alt B):** Meeting notes that feel as good as the rest of your stack.
- **Subhead:** Lume joins your Zoom, Google Meet, or Teams call, then delivers a transcript, summary, and action items you can search — and sync to Linear or Slack.
- **CTA primary:** Start free
- **CTA secondary:** See how it works
- **Reassurance line:** No credit card · 5 free meetings/month

### Logo bar

- **Label:** Works with
- **Alt label:** Join calls on

### Problem → outcome

- **Section label:** Why teams switch
- **Headline:** Legacy notetakers are slow, expensive, and hard to trust.
- **Body:** Per-seat pricing adds up fast. Cluttered UIs slow you down. Lume is built for small teams: a clean meeting document, honest free tier, and flat Pro pricing.
- **Outcome bullets:**
  - Decisions captured automatically
  - Tasks that reach Linear, not a forgotten doc
  - Search across every meeting in your workspace

### How it works

- **Section label:** How it works
- **Headline:** Three steps. No manual notes.

| Step | Title | Body |
|------|-------|------|
| 1 | Join | Paste a meeting link or upload a recording. Lume captures the conversation. |
| 2 | Understand | Get a transcript, summary, and key takeaways — speaker-aware. |
| 3 | Act | Review action items, search past meetings, sync to your tools. |

### Core capabilities

- **Section label:** What you get
- **Headline:** Everything after the meeting ends.

| Tile | Title | One-liner |
|------|-------|-----------|
| 1 | Live Sync | Add Lume to an active Zoom, Meet, or Teams call. |
| 2 | Transcripts | Full transcript with speakers, ready to skim or quote. |
| 3 | AI summaries | Overview and key takeaways without rewatching. |
| 4 | Action items | Follow-ups with owners — push to Linear in a click. |
| 5 | Search | Find what was said across your workspace. |
| 6 | Workspaces | One library for your team’s meetings. |

### Product preview

- **Section label:** Inside Lume
- **Headline:** One document per meeting.
- **Caption:** Overview, takeaways, transcript, and tasks — in a UI you’ll actually open again.
- **Image alt:** Lume meeting document showing summary, key takeaways, and action items

### Integrations teaser

- **Section label:** Integrations
- **Headline:** Send outcomes where work happens.
- **Body:** Summaries to Slack. Tasks to Linear. More tools on the way.
- **Link:** View all integrations →

### Pricing teaser

- **Section label:** Pricing
- **Headline:** Start free. Upgrade when meetings are daily.
- **Starter card:** Starter — $0 — 5 meetings/month, AI summaries & search
- **Pro card:** Studio Pro — $25/mo — Unlimited meetings, shared workspaces
- **Link:** Compare plans →

### FAQ

- **Section label:** FAQ
- **Headline:** Common questions

| Question | Answer |
|----------|--------|
| Which meeting platforms do you support? | Zoom, Google Meet, and Microsoft Teams via Live Sync. You can also upload recordings. |
| Does Lume join as a visible participant? | Yes. The assistant joins like a guest so participants know it’s recording. |
| What’s included on the free plan? | Starter includes 5 meetings per month, AI summaries, search, and a single workspace. See Pricing for storage details. |
| Is my data used to train AI models? | We use third-party AI for transcription and analysis. See Security and Privacy for what we send and how we handle your data. |
| How is Lume different from Fireflies? | Lume focuses on a modern experience and pricing that works for small teams — flat Pro pricing, not per-seat surprises. |

### Final CTA

- **Headline:** Try your next meeting with Lume.
- **Subhead:** Paste a link after signup. First summary in minutes.
- **CTA:** Start free
- **Reassurance:** No credit card required

---

## Product (`/product`)

### Meta

- **Title:** Product — Live Sync, AI notes, and task sync | Lume
- **Description:** Record or upload meetings, get transcripts and summaries, extract action items, and sync to Linear and Slack.

### Hero

- **Eyebrow:** Product
- **Headline:** Everything after the meeting ends — in one place.
- **Subhead:** Capture the call, read the summary, ship the tasks. Search it all later.
- **CTA primary:** Start free
- **CTA secondary:** View pricing

### Live Sync

- **Section label:** Live Sync
- **Headline:** Paste a link. Lume joins the call.
- **Body:** Add the assistant to Zoom, Google Meet, or Microsoft Teams while the meeting is live. Processing starts when the call ends.
- **Input placeholder (concept):** Paste meeting URL (Zoom, Meet, or Teams)
- **Micro note:** Same pipeline whether you join live or upload a file later.

### Uploads

- **Section label:** Uploads
- **Headline:** Already recorded? Upload it.
- **Body:** Drop an audio or video file when you didn’t use Live Sync. You get the same transcript, summary, and action items.

### AI meeting document

- **Section label:** Meeting document
- **Headline:** A summary you’ll actually read.
- **Body:** Every meeting becomes a structured doc: overview, key takeaways, and a speaker-aware transcript — built for skimming, not scrolling walls of text.

| UI label (in screenshot callouts) | Callout copy |
|---------------------------------|--------------|
| Overview | The gist in one pass |
| Key takeaways | Bullets you can copy to Slack |
| Transcript | Jump to who said what |

### Action items & tasks

- **Section label:** Action items
- **Headline:** Follow-ups with owners, not forgotten bullets.
- **Body:** Lume extracts tasks from the conversation. Review, edit, and sync to Linear — with meeting context attached.
- **CTA inline:** See integrations →

### Search

- **Section label:** Search
- **Headline:** Find what was decided last month.
- **Body:** Search by keyword or meaning across meetings in your workspace. Stop asking “what did we agree on?”

### Workspaces & sharing

- **Section label:** Workspaces
- **Headline:** One home for your team’s meetings.
- **Body:** Organize with channels, star important calls, and share meetings with teammates. Studio Pro adds shared workspaces for growing teams.

### Security callout

- **Headline:** Your calls are sensitive. We treat them that way.
- **Body:** Encryption in transit and at rest, workspace access controls, and clear policies on AI processing.
- **Link:** How we secure your data →

### Bottom CTA

- **Headline:** See it on your next call.
- **CTA:** Start free
- **Alt CTA:** View pricing

---

## Integrations (`/integrations`)

### Meta

- **Title:** Integrations — Slack & Linear | Lume
- **Description:** Push meeting summaries to Slack and action items to Linear. Connect after signup.

### Hero

- **Eyebrow:** Integrations
- **Headline:** Connect meetings to where work already happens.
- **Subhead:** Available today: Slack and Linear. More integrations shipping soon.
- **CTA:** Start free to connect

### Available now

- **Section label:** Available now
- **Headline:** Live today

**Slack card**

- **Title:** Slack
- **Description:** Send meeting summaries and action items to project channels.
- **Badge:** Available
- **CTA:** Connect in app →

**Linear card**

- **Title:** Linear
- **Description:** Push decisions and action items into your sprint workflow.
- **Badge:** Available
- **CTA:** Connect in app →

### Coming soon

- **Section label:** Coming soon
- **Headline:** On the roadmap
- **Subhead:** We’re expanding the catalog. Join Starter to get updates when new tools ship.
- **Card badge:** Coming soon
- **Card CTA:** — (disabled or hidden)

### How delivery works

- **Section label:** How it works
- **Headline:** Process first, then deliver.

| Step | Title | Body |
|------|-------|------|
| 1 | Meeting ends | Lume finishes transcription and analysis. |
| 2 | You review | Check the summary and action items in Lume. |
| 3 | Sync | Push summaries to Slack or tasks to Linear from the meeting doc or tasks view. |

### Bottom CTA

- **Headline:** Connect your stack after signup.
- **Subhead:** Integrations are configured from your Lume dashboard.
- **CTA:** Start free

---

## Pricing (`/pricing`)

### Meta

- **Title:** Pricing — Free Starter & Studio Pro | Lume
- **Description:** Start free with 5 meetings/month. Upgrade to Studio Pro for unlimited meetings and shared workspaces. Flat $25/mo.

### Hero

- **Eyebrow:** Pricing
- **Headline:** Simple plans. No per-seat surprises.
- **Subhead:** Try the full pipeline on Starter. Upgrade when meetings are part of your daily rhythm.
- **Toggle label (if annual later):** Monthly · Annual

### Plan cards

**Starter**

- **Name:** Starter
- **Tagline:** For focused individuals
- **Price:** $0
- **Period:** Forever free
- **CTA:** Start free
- **Features (bullets):**
  - 5 meetings per month
  - ~13 hours of recording storage
  - AI summaries & search
  - Single workspace
  - Email support

**Studio Pro** (highlighted)

- **Name:** Studio Pro
- **Tagline:** For daily meeting workflows
- **Price:** $25
- **Period:** per month
- **Badge:** Most popular
- **CTA:** Upgrade
- **Features (bullets):**
  - Unlimited meetings
  - ~2,000 hours of recordings
  - AI meeting assistant
  - Shared workspaces
  - Priority support

**Business**

- **Name:** Business
- **Tagline:** For scaling organizations
- **Price:** Custom
- **Period:** Talk to us
- **CTA:** Book a demo
- **Features (bullets):**
  - SSO & SAML
  - Admin controls & governance
  - SLA-backed support
  - Dedicated onboarding
  - Scalable storage

### Compare table

- **Section label:** Compare plans
- **Headline:** What’s included

| Row label | Starter | Studio Pro | Business |
|-----------|---------|------------|----------|
| Meetings / month | 5 | Unlimited | Custom |
| Recording storage | ~13 hours | ~2,000 hours | Custom |
| AI summaries & search | ✓ | ✓ | ✓ |
| Live Sync bot | ✓ | ✓ | ✓ |
| Shared workspaces | — | ✓ | ✓ |
| Priority support | — | ✓ | ✓ |
| SSO / SAML | — | — | ✓ |

**Footnote:** Limits reflect current plan configuration and may be updated. See Terms for billing details.

### Billing FAQ

- **Section label:** Billing FAQ
- **Headline:** Billing questions

| Question | Answer |
|----------|--------|
| Do I need a credit card for Starter? | No. Starter is free to start. |
| What happens when I hit 5 meetings on Starter? | You’ll need to wait until the next cycle or upgrade to Studio Pro for unlimited meetings. |
| Can I upgrade or downgrade anytime? | Yes. Changes apply per our billing terms. |
| Is Studio Pro priced per user? | Studio Pro is a flat workspace price — not per seat. |
| How do I get Business pricing? | Book a demo and we’ll tailor a plan for your organization. |

### Bottom CTA

- **Headline:** Start with five meetings on us.
- **CTA:** Start free

---

## Security (`/security`)

### Meta

- **Title:** Security — How Lume protects your meetings | Lume
- **Description:** Learn how Lume stores, encrypts, and processes meeting recordings, transcripts, and AI outputs.

### Hero

- **Eyebrow:** Security
- **Headline:** Your meetings deserve more than a vague “bank-level” promise.
- **Subhead:** Plain facts about what we store, who can access it, and how AI fits in.
- **Last updated:** Last updated {date}

### Sections

**What we store**

- **Headline:** What we store
- **Body:** Meeting audio, transcripts, AI-generated summaries and action items, and search embeddings derived from your content. Account and workspace metadata needed to run the product.

**Where it lives**

- **Headline:** Where it lives
- **Body:** Data is stored in secure cloud infrastructure (e.g. encrypted object storage for media, PostgreSQL for application data). Data is encrypted in transit (TLS) and at rest.

**Who can access it**

- **Headline:** Who can access it
- **Body:** Only members of your workspace according to product permissions. Lume staff access is limited to what’s required for support and operations, under internal policies.

**AI processing**

- **Headline:** AI and third-party processing
- **Body:** Transcription and analysis use third-party services. We send the minimum content required to generate transcripts, summaries, and embeddings. See Privacy Policy for subprocessors and retention.

**Retention & deletion**

- **Headline:** Retention and deletion
- **Body:** You can delete meetings and content from your workspace. Account closure triggers deletion per our Privacy Policy. Backups may persist for a limited period.

**Compliance**

- **Headline:** Compliance
- **Body (honest MVP):** We’re building toward formal compliance programs. Contact us for security questionnaires or enterprise requirements.

### Bottom links

- **Privacy:** Read our Privacy Policy →
- **Contact:** security@lume.ai (or legal@lume.ai if unified inbox)

### CTA

- **Headline:** Questions before you connect a call?
- **CTA:** Start free
- **Secondary:** Read Privacy Policy

---

## Privacy (`/privacy`)

### Meta

- **Title:** Privacy Policy | Lume
- **Description:** How Lume collects, uses, and protects personal information, including meeting recordings, transcripts, and AI processing.

### Page chrome

- **Headline:** Privacy Policy
- **Intro:** This policy describes how Lume handles personal information when you use our product — including data from meetings, calendars, and integrations.
- **Effective:** Effective {effectiveDate}
- **Contact:** privacy@lume.ai

### Plain-language summary (top of page)

- **Summary label:** Summary (not legal advice)
- **Bullets:**
  - We process meeting audio and transcripts to provide summaries, search, and integrations you enable.
  - You control workspace membership; only your team sees your workspace content.
  - We use third-party providers for transcription, AI analysis, and infrastructure.
  - You can delete meetings and request account deletion subject to our retention rules.
  - Contact privacy@lume.ai for data requests or questions.

### Cross-links

- **Security:** Security overview →
- **Terms:** Terms of Service →

---

## Terms (`/term`)

### Meta

- **Title:** Terms of Service | Lume
- **Description:** Terms governing your use of Lume.

### Page chrome

- **Headline:** Terms of Service
- **Intro:** These terms govern access to and use of Lume. By using the product, you agree to them.
- **Effective:** Effective {effectiveDate}
- **Contact:** legal@lume.ai

### Plain-language summary (top of page)

- **Summary label:** Summary (not legal advice)
- **Bullets:**
  - You must have rights to record meetings and inform participants where required.
  - Plans, limits, and billing are described on our Pricing page and in your account.
  - Don’t misuse the service or attempt to access others’ data.
  - We may update these terms; we’ll post the effective date when we do.
  - Questions: legal@lume.ai

### Cross-links

- **Privacy:** Privacy Policy →

---

## Sign in (`/authentication`) — marketing touchpoints only

- **Headline:** Welcome back
- **Subhead:** Sign in to your workspace
- **Footer link:** Don’t have an account? Start free →
- **OAuth Google:** Continue with Google
- **OAuth Microsoft:** Continue with Microsoft
- **Email:** Continue with email

---

## Micro-copy map (quick reference)

| Page | Hero headline | Primary CTA |
|------|---------------|-------------|
| Home | Never re-watch a meeting… | Start free |
| Product | Everything after the meeting ends | Start free |
| Integrations | Connect meetings to where work happens | Start free to connect |
| Pricing | Simple plans. No per-seat surprises. | Start free / Upgrade / Book a demo |
| Security | Your meetings deserve more than… | Start free |
| Privacy | Privacy Policy | — |
| Terms | Terms of Service | — |

---

*See also: [sitemap.md](./sitemap.md) · [content-strategy-mvp.md](./content-strategy-mvp.md)*
