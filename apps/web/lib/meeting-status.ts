import type { Meeting } from "@workspace/types"
import { MeetingStatusEnum } from "@workspace/types"
import type { z } from "zod"

type DbMeetingStatus = z.infer<typeof MeetingStatusEnum>

/** Map DB meeting status to dashboard card UI status (matches API presenter). */
export function dbMeetingStatusToUiStatus(
  status: string
): Meeting["status"] {
  const parsed = MeetingStatusEnum.safeParse(status)
  const dbStatus: DbMeetingStatus | string = parsed.success
    ? parsed.data
    : status

  if (dbStatus === "SUMMARIZED") return "processed"
  if (dbStatus === "TRANSCRIBING") return "transcribing"
  if (dbStatus === "FAILED") return "failed"
  return "analyzing"
}

export function isTerminalUiMeetingStatus(
  status: Meeting["status"]
): status is "processed" | "failed" {
  return status === "processed" || status === "failed"
}
