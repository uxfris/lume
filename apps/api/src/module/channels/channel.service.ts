import { Prisma } from "@workspace/database"
import { channelRepo } from "./channel.repo"

export async function listChannels(input: { workspaceId: string }) {
  const channels = await channelRepo.listByWorkspace(input.workspaceId)
  return {
    channels: channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      type: channel.type,
      meetingCount: channel._count.meetings,
      createdAt: channel.createdAt.toISOString(),
      updatedAt: channel.updatedAt.toISOString(),
    })),
  }
}

export async function updateChannel(input: {
  channelId: string
  workspaceId: string
  name?: string
  description?: string | null
  type?: "PUBLIC" | "PRIVATE"
}): Promise<
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "NAME_CONFLICT"; message?: string }
> {
  try {
    const result = await channelRepo.updateByWorkspace({
      channelId: input.channelId,
      workspaceId: input.workspaceId,
      data: {
        name: input.name,
        description: input.description,
        type: input.type,
      },
    })

    if (result.count === 0) {
      return { ok: false, reason: "NOT_FOUND" }
    }

    return { ok: true }
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        ok: false,
        reason: "NAME_CONFLICT",
        message: "A channel with this name already exists.",
      }
    }
    throw err
  }
}

export async function deleteChannel(input: {
  channelId: string
  workspaceId: string
}): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" }> {
  const result = await channelRepo.removeByWorkspace(
    input.channelId,
    input.workspaceId
  )
  return result.count > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}

export async function listChannelMeetings(input: {
  channelId: string
  workspaceId: string
  limit: number
}): Promise<
  | {
      ok: true
      meetings: {
        id: string
        title: string
        status: string
        meetingUrl: string | null
        createdAt: string
      }[]
    }
  | { ok: false; reason: "NOT_FOUND" }
> {
  const exists = await channelRepo.findByIdForWorkspace(
    input.channelId,
    input.workspaceId
  )
  if (!exists) return { ok: false, reason: "NOT_FOUND" }

  const meetings = await channelRepo.listMeetingsByChannel({
    workspaceId: input.workspaceId,
    channelId: input.channelId,
    limit: input.limit,
  })

  return {
    ok: true,
    meetings: meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      status: meeting.status,
      meetingUrl: meeting.meetingUrl,
      createdAt: meeting.createdAt.toISOString(),
    })),
  }
}

export async function addMeetingsToChannel(input: {
  channelId: string
  workspaceId: string
  meetingIds: string[]
}): Promise<
  | { ok: true; updatedCount: number }
  | { ok: false; reason: "NOT_FOUND" }
> {
  const exists = await channelRepo.findByIdForWorkspace(
    input.channelId,
    input.workspaceId
  )
  if (!exists) return { ok: false, reason: "NOT_FOUND" }

  const result = await channelRepo.assignMeetingsToChannel(input)
  return { ok: true, updatedCount: result.count }
}

export async function removeMeetingsFromChannel(input: {
  channelId: string
  workspaceId: string
  meetingIds?: string[]
}): Promise<
  | { ok: true; updatedCount: number }
  | { ok: false; reason: "NOT_FOUND" }
> {
  const exists = await channelRepo.findByIdForWorkspace(
    input.channelId,
    input.workspaceId
  )
  if (!exists) return { ok: false, reason: "NOT_FOUND" }

  const result = await channelRepo.unassignMeetingsFromChannel(input)
  return { ok: true, updatedCount: result.count }
}
