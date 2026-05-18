import { prisma } from "@workspace/database"
import type { Workspace, WorkspaceRole } from "@workspace/database"

export const workspacesRepo = {
  findMembershipWithWorkspace(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
      include: { workspace: true },
    })
  },

  listMembershipsForUser(userId: string) {
    return prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { joinedAt: "asc" },
    })
  },

  listWorkspaceMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    })
  },

  listPendingInvitations(workspaceId: string, now: Date) {
    return prisma.invitation.findMany({
      where: {
        workspaceId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: {
          gte: now,
        },
      },
      orderBy: { createdAt: "asc" },
    })
  },

  createWorkspaceWithOwner(
    userId: string,
    name: string,
    slug: string
  ): Promise<Workspace> {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name, slug },
      })

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: "OWNER",
        },
      })

      return workspace
    })
  },

  updateWorkspaceName(workspaceId: string, name: string) {
    return prisma.workspace.update({
      where: { id: workspaceId },
      data: { name },
    })
  },

  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
  },

  findUsersByEmails(emails: string[]) {
    return prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })
  },

  findMemberByWorkspaceAndUser(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    })
  },

  findMemberById(memberId: string) {
    return prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })
  },

  countOwners(workspaceId: string) {
    return prisma.workspaceMember.count({
      where: { workspaceId, role: "OWNER" },
    })
  },

  countMembershipsForUser(userId: string) {
    return prisma.workspaceMember.count({
      where: { userId },
    })
  },

  updateMemberRole(memberId: string, role: WorkspaceRole) {
    return prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
    })
  },

  deleteMember(memberId: string) {
    return prisma.workspaceMember.delete({
      where: { id: memberId },
    })
  },

  findInvitationByWorkspaceAndEmail(workspaceId: string, email: string) {
    return prisma.invitation.findUnique({
      where: {
        workspaceId_email: { workspaceId, email },
      },
    })
  },

  findInvitationById(invitationId: string) {
    return prisma.invitation.findUnique({
      where: { id: invitationId },
    })
  },

  upsertInvitation(input: {
    workspaceId: string
    email: string
    role: Exclude<WorkspaceRole, "OWNER">
    tokenHash: string
    invitedByUserId: string
    expiresAt: Date
  }) {
    const { workspaceId, email, role, tokenHash, invitedByUserId, expiresAt } =
      input
    return prisma.invitation.upsert({
      where: {
        workspaceId_email: { workspaceId, email },
      },
      create: {
        workspaceId,
        email,
        role,
        tokenHash,
        invitedByUserId,
        expiresAt,
      },
      update: {
        role,
        tokenHash,
        invitedByUserId,
        expiresAt,
        acceptedAt: null,
        revokedAt: null,
      },
    })
  },

  findInvitationByTokenHash(tokenHash: string) {
    return prisma.invitation.findUnique({
      where: { tokenHash },
    })
  },

  markInvitationAccepted(id: string, acceptedAt: Date) {
    return prisma.invitation.update({
      where: { id },
      data: { acceptedAt },
    })
  },

  markInvitationRevoked(id: string, revokedAt: Date) {
    return prisma.invitation.update({
      where: { id },
      data: { revokedAt },
    })
  },

  acceptInvitationAndCreateMembership(input: {
    invitationId: string
    workspaceId: string
    userId: string
    role: WorkspaceRole
    acceptedAt: Date
  }) {
    const { invitationId, workspaceId, userId, role, acceptedAt } = input
    return prisma.$transaction(async (tx) => {
      await tx.workspaceMember.create({
        data: {
          workspaceId,
          userId,
          role,
        },
      })

      await tx.invitation.update({
        where: { id: invitationId },
        data: { acceptedAt },
      })
    })
  },

  findInviteLinkByWorkspace(workspaceId: string) {
    return prisma.workspaceInviteLink.findUnique({
      where: { workspaceId },
    })
  },

  findInviteLinkByTokenHash(tokenHash: string) {
    return prisma.workspaceInviteLink.findUnique({
      where: { tokenHash },
    })
  },

  upsertInviteLink(input: {
    workspaceId: string
    role: WorkspaceRole
    tokenHash: string
    expiresAt: Date
    createdByUserId: string
  }) {
    const { workspaceId, role, tokenHash, expiresAt, createdByUserId } = input
    return prisma.workspaceInviteLink.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        role,
        tokenHash,
        expiresAt,
        createdByUserId,
      },
      update: {
        role,
        tokenHash,
        expiresAt,
        createdByUserId,
        revokedAt: null,
      },
    })
  },

  revokeInviteLink(workspaceId: string, revokedAt: Date) {
    return prisma.workspaceInviteLink.updateMany({
      where: { workspaceId, revokedAt: null },
      data: { revokedAt },
    })
  },

  createMembership(input: {
    workspaceId: string
    userId: string
    role: WorkspaceRole
  }) {
    return prisma.workspaceMember.create({
      data: input,
    })
  },
}
