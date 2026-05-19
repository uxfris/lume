import z from "zod"

export const joinMeetingSchema = z.object({
  url: z
    .url("Must be a valid URL (https://example.com)")
    .min(1, "Meeting url is required")
    .refine(
      (val) =>
        val.includes("meet.google.com") ||
        val.includes("teams.microsoft.com") ||
        val.includes("https://zoom.us"),
      "Only Google Meet, Microsoft Teams, and Zoom link are allowed"
    ),
  name: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().min(1).max(200).optional()
  ),
})
