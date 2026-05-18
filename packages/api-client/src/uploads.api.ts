import {
  CompleteUploadResponseSchema,
  FetchFromLinkResponseSchema,
  ListUploadsResponseSchema,
  PresignUploadResponseSchema,
  type CompleteUploadResponse,
  type FetchFromLinkBody,
  type FetchFromLinkResponse,
  type PresignUploadResponse,
  type UploadSummary,
  PresignUploadBody,
  ListUploadsQuery,
} from "@workspace/types"
import { client } from "./client"

export type UploadSignedUrlOptions = {
  signal?: AbortSignal
  onProgress?: (percent: number) => void
}

export const uploadsApi = {
  async list({ limit = 20 }: ListUploadsQuery): Promise<UploadSummary[]> {
    const data = await client.get<unknown>("/uploads", { params: { limit } })
    const parsed = ListUploadsResponseSchema.parse(data)
    return parsed.uploads
  },

  async presign(input: PresignUploadBody): Promise<PresignUploadResponse> {
    const data = await client.post<unknown>("/uploads/presign", input)
    return PresignUploadResponseSchema.parse(data)
  },

  async complete(meetingId: string): Promise<CompleteUploadResponse> {
    const data = await client.post<unknown>(
      `/uploads/${meetingId}/complete`,
      {}
    )
    return CompleteUploadResponseSchema.parse(data)
  },

  async fetchFromLink(
    input: FetchFromLinkBody
  ): Promise<FetchFromLinkResponse> {
    const data = await client.post<unknown>("/uploads/from-url", input)
    return FetchFromLinkResponseSchema.parse(data)
  },

  uploadToSignedUrl(
    url: string,
    file: File,
    options: UploadSignedUrlOptions = {}
  ): Promise<void> {
    const { signal, onProgress } = options

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("PUT", url)
      xhr.setRequestHeader("Content-Type", file.type)

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || !onProgress) return
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(Math.max(0, Math.min(100, percent)))
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100)
          resolve()
          return
        }
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }

      xhr.onerror = () => reject(new Error("Network error during upload"))

      if (signal) {
        signal.addEventListener("abort", () => {
          xhr.abort()
          reject(new DOMException("Aborted", "AbortError"))
        })
      }

      xhr.send(file)
    })
  },
}
