import { Prisma } from "@workspace/database"
import type { Meeting as MeetingDTO } from "@workspace/types"
import { toMeetingDTO } from "../meetings/meetings.presenter"
import { channelRepo } from "./channel.repo"

function toChannelDTO(channel: {
  id: string
  name: string
  description: string | null
  type: "PUBLIC" | "PRIVATE"
  createdAt: Date
  updatedAt: Date
  _count: { meetings: number }
}) {
  return {
    id: channel.id,
    name: channel.name,
    description: channel.description,
    type: channel.type,
    meetingCount: channel._count.meetings,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString(),
  }
}

export async function listChannels(input: { workspaceId: string; userId: string }) {
  const channels = await channelRepo.listVisibleByWorkspace(
    input.workspaceId,
    input.userId
  )
  return {
    channels: channels.map(toChannelDTO),
  }
}

export async function createChannel(input: {
  workspaceId: string
  creatorId: string
  name: string
  description?: string | null
  type: "PUBLIC" | "PRIVATE"
}): Promise<
  | { ok: true; channel: ReturnType<typeof toChannelDTO> }
  | { ok: false; reason: "NAME_CONFLICT"; message?: string }
> {
  try {
    const channel = await channelRepo.create(input)
    return { ok: true, channel: toChannelDTO(channel) }
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

export async function getChannelById(input: {
  channelId: string
  workspaceId: string
  userId: string
}): Promise<ReturnType<typeof toChannelDTO> | null> {
  const channel = await channelRepo.findAccessibleById(input)
  if (!channel) return null
  return toChannelDTO(channel)
}

export async function updateChannel(input: {
  channelId: string
  workspaceId: string
  userId: string
  name?: string
  description?: string | null
  type?: "PUBLIC" | "PRIVATE"
}): Promise<
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "NAME_CONFLICT"; message?: string }
> {
  try {
    const exists = await channelRepo.findAccessibleById({
      channelId: input.channelId,
      workspaceId: input.workspaceId,
      userId: input.userId,
    })
    if (!exists) return { ok: false, reason: "NOT_FOUND" }

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
  userId: string
}): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" }> {
  const exists = await channelRepo.findAccessibleById({
    channelId: input.channelId,
    workspaceId: input.workspaceId,
    userId: input.userId,
  })
  if (!exists) return { ok: false, reason: "NOT_FOUND" }

  const result = await channelRepo.removeByWorkspace(
    input.channelId,
    input.workspaceId
  )
  return result.count > 0 ? { ok: true } : { ok: false, reason: "NOT_FOUND" }
}

export async function listChannelMeetings(input: {
  channelId: string
  workspaceId: string
  userId: string
  limit: number
}): Promise<
  | { ok: true; meetings: MeetingDTO[] }
  | { ok: false; reason: "NOT_FOUND" }
> {
  const exists = await channelRepo.findAccessibleById(input)
  if (!exists) return { ok: false, reason: "NOT_FOUND" }

  const meetings = await channelRepo.listMeetingsByChannel({
    workspaceId: input.workspaceId,
    channelId: input.channelId,
    limit: input.limit,
  })

  return {
    ok: true,
    meetings: meetings.map((meeting) => toMeetingDTO(meeting)),
  }
}

export async function addMeetingsToChannel(input: {
  channelId: string
  workspaceId: string
  userId: string
  meetingIds: string[]
}): Promise<
  | { ok: true; updatedCount: number }
  | { ok: false; reason: "NOT_FOUND" }
> {
  const exists = await channelRepo.findAccessibleById(input)
  if (!exists) return { ok: false, reason: "NOT_FOUND" }

  const result = await channelRepo.assignMeetingsToChannel(input)
  return { ok: true, updatedCount: result.count }
}

export async function removeMeetingsFromChannel(input: {
  channelId: string
  workspaceId: string
  userId: string
  meetingIds?: string[]
}): Promise<
  | { ok: true; updatedCount: number }
  | { ok: false; reason: "NOT_FOUND" }
> {
  const exists = await channelRepo.findAccessibleById(input)
  if (!exists) return { ok: false, reason: "NOT_FOUND" }

  const result = await channelRepo.unassignMeetingsFromChannel(input)
  return { ok: true, updatedCount: result.count }
}
