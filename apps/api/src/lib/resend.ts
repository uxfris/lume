import { Resend } from "resend"
import { env } from "../config/env"

let client: Resend | null = null

function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null
  client ??= new Resend(env.RESEND_API_KEY)
  return client
}

export type SendTransactionalEmailInput = {
  to: string[]
  subject: string
  text: string
  html: string
}

export async function sendTransactionalEmail(
  input: SendTransactionalEmailInput
): Promise<{ ok: true; id: string } | { ok: false; reason: "NOT_CONFIGURED" | "SEND_FAILED" }> {
  const resend = getResendClient()
  if (!resend || !env.RESEND_FROM_EMAIL) {
    return { ok: false, reason: "NOT_CONFIGURED" }
  }

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  })

  if (error || !data?.id) {
    return { ok: false, reason: "SEND_FAILED" }
  }

  return { ok: true, id: data.id }
}
