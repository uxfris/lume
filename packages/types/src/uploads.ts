import { z } from "zod"
import { MeetingStatusEnum } from "./meetings"

/**
 * Allowlist of accepted MIME types. Mirrors the UI hints in
 * `apps/web/app/(app)/dashboard/uploads/_components/upload-input.tsx`.
 */
const ALLOWED_MIME_PATTERNS = [/^audio\//i, /^video\//i, /^application\/pdf$/i]

export function isAllowedUploadMime(value: string): boolean {
  return ALLOWED_MIME_PATTERNS.some((pattern) => pattern.test(value))
}

export const MAX_UPLOAD_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024

const fileTypeSchema = z.string().min(1).max(255).refine(isAllowedUploadMime, {
  message: "Unsupported file type. Allowed: audio/*, video/*, application/pdf.",
})

export const FetchFromLinkBodySchema = z.object({
  url: z.url({ message: "Enter a valid HTTP or HTTPS URL." }),
  title: z.string().min(1).max(200).optional(),
})
export type FetchFromLinkBody = z.infer<typeof FetchFromLinkBodySchema>

export const PresignUploadBodySchema = z.object({
  fileName: z.string().min(1).max(512),
  fileType: fileTypeSchema,
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_FILE_SIZE_BYTES, { message: "File too large." }),
  title: z.string().min(1).max(200).optional(),
})
export type PresignUploadBody = z.infer<typeof PresignUploadBodySchema>

export const UploadSummarySchema = z.object({
  meetingId: z.string(),
  title: z.string(),
  fileName: z.string().nullable(),
  fileType: z.string().nullable(),
  fileSize: z.number().nullable(),
  status: MeetingStatusEnum,
  createdAt: z.string(),
})
export type UploadSummary = z.infer<typeof UploadSummarySchema>

export const ListUploadsResponseSchema = z.object({
  uploads: z.array(UploadSummarySchema),
})

export const PresignUploadResponseSchema = z.object({
  meetingId: z.string(),
  key: z.string(),
  url: z.string(),
  expiresInSeconds: z.number(),
})

export type PresignUploadResponse = z.infer<typeof PresignUploadResponseSchema>

export const CompleteUploadResponseSchema = z.object({
  meetingId: z.string(),
  status: z.string(),
})

export type CompleteUploadResponse = z.infer<
  typeof CompleteUploadResponseSchema
>

export const FetchFromLinkResponseSchema = CompleteUploadResponseSchema
export type FetchFromLinkResponse = CompleteUploadResponse

export const ListUploadsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListUploadsQuery = z.infer<typeof ListUploadsQuerySchema>
