import { sendTransactionalEmail } from "../../lib/resend"
import { env } from "../../config/env"

export function buildMeetingShareUrl(meetingId: string): string {
  const base = env.FRONTEND_URL.replace(/\/$/, "")
  return `${base}/meeting/${meetingId}`
}

export async function sendMeetingShareInviteEmail(input: {
  to: string
  inviterName: string
  meetingTitle: string
  meetingUrl: string
  role: "view" | "edit"
}): Promise<void> {
  const roleLabel = input.role === "edit" ? "edit" : "view"
  const subject = `${input.inviterName} shared a meeting with you`
  const text = [
    `${input.inviterName} invited you to ${roleLabel} "${input.meetingTitle}" on Lume.`,
    "",
    `Open the meeting: ${input.meetingUrl}`,
  ].join("\n")

  const html = `<div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
<p><strong>${escapeHtml(input.inviterName)}</strong> invited you to <strong>${escapeHtml(roleLabel)}</strong> a meeting on Lume.</p>
<p style="font-size: 18px; font-weight: 600; margin: 24px 0 8px;">${escapeHtml(input.meetingTitle)}</p>
<p><a href="${escapeHtml(input.meetingUrl)}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 500;">Open meeting</a></p>
<p style="color: #666; font-size: 13px; margin-top: 32px;">If the button does not work, copy this link:<br /><a href="${escapeHtml(input.meetingUrl)}">${escapeHtml(input.meetingUrl)}</a></p>
</div>`

  await sendTransactionalEmail({
    to: [input.to],
    subject,
    text,
    html,
  })
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
