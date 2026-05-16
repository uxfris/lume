import { z } from "zod"

export const MeetingShareRoleSchema = z.enum(["view", "edit"])
export type MeetingShareRole = z.infer<typeof MeetingShareRoleSchema>

export const MeetingGeneralAccessSchema = z.enum([
  "restricted",
  "workspace",
  "link",
])
export type MeetingGeneralAccess = z.infer<typeof MeetingGeneralAccessSchema>

export const MeetingShareCollaboratorSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  avatarInitials: z.string().min(1).max(3),
  role: MeetingShareRoleSchema,
  isOwner: z.boolean().default(false),
  isCurrentUser: z.boolean().default(false),
})

export type MeetingShareCollaborator = z.infer<
  typeof MeetingShareCollaboratorSchema
>

export const MeetingShareStateSchema = z.object({
  meetingId: z.string(),
  generalAccess: MeetingGeneralAccessSchema,
  linkEnabled: z.boolean(),
  shareUrl: z.url(),
  collaborators: z.array(MeetingShareCollaboratorSchema),
  canManage: z.boolean(),
})

export type MeetingShareState = z.infer<typeof MeetingShareStateSchema>

export const InviteMeetingShareBodySchema = z.object({
  emails: z.array(z.email()).min(1).max(20),
  role: MeetingShareRoleSchema.default("view"),
})

export type InviteMeetingShareBody = z.infer<
  typeof InviteMeetingShareBodySchema
>

export const InviteMeetingShareResponseSchema = z.object({
  invited: z.array(
    z.object({
      email: z.email(),
      shareId: z.string(),
    })
  ),
  skipped: z.array(
    z.object({
      email: z.email(),
      reason: z.enum(["OWNER", "ALREADY_SHARED", "INVALID"]),
    })
  ),
})

export type InviteMeetingShareResponse = z.infer<
  typeof InviteMeetingShareResponseSchema
>

export const UpdateMeetingShareBodySchema = z.object({
  role: MeetingShareRoleSchema,
})

export const UpdateMeetingGeneralAccessBodySchema = z.object({
  generalAccess: MeetingGeneralAccessSchema,
})
