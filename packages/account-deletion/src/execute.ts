import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { prisma } from "@workspace/database"
import Stripe from "stripe"

function buildUserAvatarKey(userId: string): string {
  return `users/${userId}/avatar`
}

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  return key ? new Stripe(key) : null
}

function getS3(): S3Client | null {
  const region = process.env.AWS_REGION
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  if (!region || !accessKeyId || !secretAccessKey) return null
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  })
}

async function cancelWorkspaceStripeSubscription(stripeSubscriptionId: string) {
  const stripe = getStripe()
  if (!stripe) return

  try {
    await stripe.subscriptions.cancel(stripeSubscriptionId)
  } catch {
    // Best-effort: workspace row is removed even if Stripe is unreachable.
  }
}

async function deleteUserAvatarFromS3(userId: string) {
  const bucket = process.env.S3_BUCKET
  const s3 = getS3()
  if (!bucket || !s3) return

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: buildUserAvatarKey(userId),
      })
    )
  } catch {
    // Avatar may not exist.
  }
}

async function listSoleOwnerWorkspaces(userId: string) {
  const ownerMemberships = await prisma.workspaceMember.findMany({
    where: { userId, role: "OWNER" },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          stripeSubscriptionId: true,
        },
      },
    },
  })

  const soleOwnerWorkspaces: {
    id: string
    name: string
    stripeSubscriptionId: string | null
  }[] = []

  for (const membership of ownerMemberships) {
    const ownerCount = await prisma.workspaceMember.count({
      where: { workspaceId: membership.workspaceId, role: "OWNER" },
    })
    if (ownerCount === 1) {
      soleOwnerWorkspaces.push(membership.workspace)
    }
  }

  return soleOwnerWorkspaces
}

/**
 * Permanently removes a user and owned resources. Idempotent when the user row
 * is already gone.
 */
export async function executeAccountDeletion(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!user) return

  const soleOwnerWorkspaces = await listSoleOwnerWorkspaces(userId)
  const soleOwnerWorkspaceIds = new Set(
    soleOwnerWorkspaces.map((workspace) => workspace.id)
  )

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  })
  const sharedWorkspaceIds = memberships
    .map((membership) => membership.workspaceId)
    .filter((workspaceId) => !soleOwnerWorkspaceIds.has(workspaceId))

  for (const workspace of soleOwnerWorkspaces) {
    if (workspace.stripeSubscriptionId) {
      await cancelWorkspaceStripeSubscription(workspace.stripeSubscriptionId)
    }
  }

  if (sharedWorkspaceIds.length > 0) {
    await prisma.meeting.deleteMany({
      where: { userId, workspaceId: { in: sharedWorkspaceIds } },
    })
  }

  await prisma.channel.deleteMany({
    where: { creatorId: userId },
  })

  if (soleOwnerWorkspaceIds.size > 0) {
    await prisma.workspace.deleteMany({
      where: { id: { in: [...soleOwnerWorkspaceIds] } },
    })
  }

  await deleteUserAvatarFromS3(userId)
  await prisma.user.delete({ where: { id: userId } })
}
