export const ACCOUNT_DELETION_GRACE_DAYS = 7

export const ACCOUNT_DELETION_GRACE_MS =
  ACCOUNT_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000

export function accountDeletionJobId(userId: string): string {
  return `account-deletion-${userId}`
}

export function computeScheduledDeletionAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + ACCOUNT_DELETION_GRACE_MS)
}
