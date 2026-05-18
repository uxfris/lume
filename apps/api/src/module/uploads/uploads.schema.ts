import { z } from "zod"
import {
  UploadSummarySchema,
  ListUploadsResponseSchema,
  PresignUploadResponseSchema,
  CompleteUploadResponseSchema,
  PresignUploadBodySchema,
  FetchFromLinkBodySchema,
  FetchFromLinkResponseSchema,
  ListUploadsQuerySchema,
} from "@workspace/types"

export const presignUploadBodySchema = PresignUploadBodySchema

export const fetchFromLinkBodySchema = FetchFromLinkBodySchema

export const fetchFromLinkResponseSchema = FetchFromLinkResponseSchema

export const presignUploadResponseSchema = PresignUploadResponseSchema

export const completeUploadParamsSchema = z.object({
  id: z.string().min(1),
})

export const completeUploadResponseSchema = CompleteUploadResponseSchema

export const uploadSummarySchema = UploadSummarySchema

export const listUploadsQuerySchema = ListUploadsQuerySchema

export const listUploadsResponseSchema = ListUploadsResponseSchema

export const uploadErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})
