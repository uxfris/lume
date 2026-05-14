"use client"

import { uploadsApi } from "@workspace/api-client"
import type { UploadSummary } from "@workspace/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

type InFlightUpload = {
  meetingId: string
  title: string
  fileName: string
  fileType: string
  fileSize: number
  progress: number
  createdAt: string
  status: UploadSummary["status"]
}

type ProcessingStage = "TRANSCRIBE" | "DIARIZE" | "ANALYZE" | "EMBED"
type ProcessingEventPayload = {
  meetingStatus?: UploadSummary["status"] | null
  stage?: ProcessingStage
  status?: "STARTED" | "SUCCEEDED" | "FAILED"
}

const STAGE_PROGRESS: Record<ProcessingStage, number> = {
  TRANSCRIBE: 35,
  DIARIZE: 55,
  ANALYZE: 75,
  EMBED: 90,
}

function deriveTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "").trim()
  return withoutExt.length > 0 ? withoutExt : "Untitled meeting"
}

export function useUpload() {
  const { workspaceId } = useCurrentWorkspace()

  const queryClient = useQueryClient()

  // ✅ Server state handled by React Query
  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads", workspaceId],
    queryFn: () => uploadsApi.list({ limit: 20 }),
  })

  // ✅ Client-side ephemeral state
  const [inFlight, setInFlight] = useState<Record<string, InFlightUpload>>({})
  const [stageByMeetingId, setStageByMeetingId] = useState<
    Record<string, ProcessingStage>
  >({})

  useEffect(() => {
    const pendingMeetingIds = uploads
      .filter((upload) => !["SUMMARIZED", "FAILED"].includes(upload.status))
      .map((upload) => upload.meetingId)

    if (pendingMeetingIds.length === 0) return

    const baseApiUrl = "/api"

    const streams = pendingMeetingIds.map((meetingId) => {
      const source = new EventSource(
        `${baseApiUrl}/meetings/${meetingId}/events`
      )

      source.addEventListener("processing.event", (event) => {
        const payload = JSON.parse(
          (event as MessageEvent).data
        ) as ProcessingEventPayload

        if (payload.stage && payload.status === "STARTED") {
          setStageByMeetingId((prev) => ({
            ...prev,
            [meetingId]: payload.stage!,
          }))
        }

        if (payload.status === "SUCCEEDED" && payload.stage === "EMBED") {
          setStageByMeetingId((prev) => {
            const next = { ...prev }
            delete next[meetingId]
            return next
          })
        }

        if (payload.status === "FAILED") {
          setStageByMeetingId((prev) => {
            const next = { ...prev }
            delete next[meetingId]
            return next
          })
        }

        if (!payload.meetingStatus) return

        queryClient.setQueryData<UploadSummary[]>(["uploads"], (current = []) =>
          current.map((upload) =>
            upload.meetingId === meetingId
              ? {
                  ...upload,
                  status: payload.meetingStatus as UploadSummary["status"],
                }
              : upload
          )
        )
      })

      return source
    })

    return () => {
      for (const source of streams) source.close()
    }
  }, [queryClient, uploads])

  useEffect(() => {
    const hasPending = uploads.some(
      (upload) => !["SUMMARIZED", "FAILED"].includes(upload.status)
    )
    if (!hasPending) return

    const timer = window.setInterval(() => {
      // Safety net in case SSE is interrupted by the network/proxy.
      queryClient.invalidateQueries({ queryKey: ["uploads"] })
    }, 8000)

    return () => window.clearInterval(timer)
  }, [queryClient, uploads])

  const handleUploadFile = useCallback(
    async (file: File) => {
      const title = deriveTitle(file.name)
      let meetingId: string | null = null

      try {
        const presigned = await uploadsApi.presign({
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          title,
        })

        meetingId = presigned.meetingId

        const createdAt = new Date().toISOString()

        // initialize upload
        setInFlight((prev) => ({
          ...prev,
          [meetingId!]: {
            meetingId: meetingId!,
            title,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            progress: 0,
            createdAt,
            status: "PENDING_UPLOAD",
          },
        }))

        await uploadsApi.uploadToSignedUrl(presigned.url, file, {
          onProgress: (percent) => {
            setInFlight((prev) => {
              const current = prev[meetingId!]
              if (!current) return prev
              return {
                ...prev,
                [meetingId!]: { ...current, progress: percent },
              }
            })
          },
        })

        // mark processing
        setInFlight((prev) => {
          const current = prev[meetingId!]
          if (!current) return prev
          return {
            ...prev,
            [meetingId!]: {
              ...current,
              status: "UPLOADED",
              progress: 100,
            },
          }
        })

        await uploadsApi.complete(meetingId)

        // remove from inFlight
        setInFlight((prev) => {
          const next = { ...prev }
          delete next[meetingId!]
          return next
        })

        // ✅ tell React Query data is stale
        queryClient.invalidateQueries({ queryKey: ["uploads", workspaceId] })

        toast.success("Upload queued for transcription")
      } catch (error) {
        if (meetingId) {
          setInFlight((prev) => {
            const current = prev[meetingId!]
            if (!current) return prev
            return {
              ...prev,
              [meetingId!]: { ...current, status: "FAILED" },
            }
          })
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Upload failed. Please retry."
        )
      }
    },
    [queryClient]
  )

  const displayUploads = useMemo(() => {
    const inFlightList: UploadSummary[] = Object.values(inFlight).map(
      (item) => ({
        meetingId: item.meetingId,
        title: item.title,
        fileName: item.fileName,
        fileType: item.fileType,
        fileSize: item.fileSize,
        createdAt: item.createdAt,
        status: item.status,
      })
    )

    const inFlightIds = new Set(inFlightList.map((u) => u.meetingId))
    const filteredUploads = uploads.filter((u) => !inFlightIds.has(u.meetingId))

    return [...inFlightList, ...filteredUploads]
  }, [inFlight, uploads])

  const progressByMeetingId = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of Object.values(inFlight)) {
      map[item.meetingId] = item.progress
    }
    for (const [meetingId, stage] of Object.entries(stageByMeetingId)) {
      if (map[meetingId] == null) {
        map[meetingId] = STAGE_PROGRESS[stage]
      }
    }
    return map
  }, [inFlight, stageByMeetingId])

  return {
    handleUploadFile,
    displayUploads,
    progressByMeetingId,
    stageByMeetingId,
    loading: isLoading,
  }
}
