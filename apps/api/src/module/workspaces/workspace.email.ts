import { sendTransactionalEmail } from "../../lib/resend"
import { env } from "../../config/env"

export function buildWorkspaceInviteUrl(inviteToken: string): string {
  const base = env.FRONTEND_URL.replace(/\/$/, "")
  return `${base}/invite/${inviteToken}`
}

export async function sendWorkspaceInviteEmail(input: {
  to: string
  inviterName: string
  workspaceName: string
  inviteUrl: string
}): Promise<void> {
  const subject = `${input.inviterName} invited you to join ${input.workspaceName}`

  const text = [
    `${input.inviterName} invited you to join the workspace "${input.workspaceName}" on Lume.`,
    "",
    `Accept invitation: ${input.inviteUrl}`,
  ].join("\n")

  const html = `<div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
<p><strong>${escapeHtml(input.inviterName)}</strong> invited you to join a workspace on Lume.</p>

<p style="font-size: 18px; font-weight: 600; margin: 24px 0 8px;">
  ${escapeHtml(input.workspaceName)}
</p>

<p>
  <a
    href="${escapeHtml(input.inviteUrl)}"
    style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 500;"
  >
    Join workspace
  </a>
</p>

<p style="color: #666; font-size: 13px; margin-top: 32px;">
  If the button does not work, copy this link:<br />
  <a href="${escapeHtml(input.inviteUrl)}">${escapeHtml(input.inviteUrl)}</a>
</p>
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
