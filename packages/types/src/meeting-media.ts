import { z } from "zod"

export const MeetingAudioResponseSchema = z.object({
  url: z.string().url(),
  expiresInSeconds: z.number().int().positive(),
})

export type MeetingAudioResponse = z.infer<typeof MeetingAudioResponseSchema>
