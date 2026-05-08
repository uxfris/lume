import {
  StartBotMeetingBodySchema,
  StartBotMeetingResponseSchema,
  type StartBotMeetingBody,
  type StartBotMeetingResponse,
} from "@workspace/types"
import { client } from "./client"

export const botsApi = {
  /**
   * Dispatch a Recall.ai bot to a Zoom / Google Meet / Microsoft Teams call
   * for the current workspace.
   */
  async startBotMeeting(
    input: StartBotMeetingBody
  ): Promise<StartBotMeetingResponse> {
    const body = StartBotMeetingBodySchema.parse(input)
    const data = await client.post<unknown>("/meetings/bot", body)
    return StartBotMeetingResponseSchema.parse(data)
  },
}
