const EMAIL_SPLIT = /[,;\s]+/

export function parseInviteEmails(raw: string): string[] {
  const seen = new Set<string>()
  const emails: string[] = []

  for (const part of raw.split(EMAIL_SPLIT)) {
    const email = part.trim().toLowerCase()
    if (!email || !email.includes("@")) continue
    if (seen.has(email)) continue
    seen.add(email)
    emails.push(email)
  }

  return emails
}
