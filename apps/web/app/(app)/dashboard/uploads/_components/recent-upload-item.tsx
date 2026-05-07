"use client"

import {
  CheckCircle,
  Clapperboard,
  CloseCircle,
  Document,
  Soundwave,
} from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { toast } from "sonner"
import { formatTimeAgoIntl } from "@/lib/date-format"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { UploadSummary } from "@workspace/types"

function getKindFromMime(fileType: string | null): "video" | "audio" | "pdf" {
  if (!fileType) return "audio"
  if (fileType.startsWith("video/")) return "video"
  if (fileType === "application/pdf") return "pdf"
  return "audio"
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "Unknown size"
  const units = ["B", "KB", "MB", "GB", "TB"]
  let value = bytes
  let idx = 0
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024
    idx += 1
  }
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[idx]}`
}

export function RecentUploadItem({
  item,
  className,
  progress,
  stage,
}: {
  item: UploadSummary
  className?: string
  progress?: number
  stage?: "TRANSCRIBE" | "DIARIZE" | "ANALYZE" | "EMBED"
}) {
  const { title, status, fileSize, createdAt, fileType } = item
  const kind = getKindFromMime(fileType)
  const statusText =
    stage === "DIARIZE"
      ? "Diarizing..."
      : stage === "EMBED"
        ? "Embedding..."
        : stage === "ANALYZE"
          ? "Analyzing..."
          : stage === "TRANSCRIBE"
            ? "Transcribing..."
            : null

  const cancelUpload = () => {
    toast("Upload cancelled", {
      position: "bottom-center",
      action: {
        label: "Undo",
        onClick: () => {},
      },
    })
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-md px-4 py-4 hover:bg-secondary md:gap-6",
        className
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-md",
          kind === "video" && "bg-accent-2",
          kind === "audio" && "bg-accent-3",
          kind === "pdf" && "bg-accent"
        )}
      >
        {kind === "video" && <Clapperboard weight="Bold" size={20} />}
        {kind === "audio" && <Soundwave weight="Bold" size={20} />}
        {kind === "pdf" && <Document weight="Bold" size={20} />}
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatBytes(fileSize)} •{" "}
              {status === "PENDING_UPLOAD" && "Uploading..."}
              {status === "UPLOADED" && "Queued..."}
              {(status === "TRANSCRIBING" || status === "ANALYZING") &&
                (statusText ??
                  (status === "TRANSCRIBING"
                    ? "Transcribing..."
                    : "Analyzing..."))}
              {status !== "PENDING_UPLOAD" &&
                status !== "UPLOADED" &&
                status !== "TRANSCRIBING" &&
                status !== "ANALYZING" &&
                formatTimeAgoIntl(createdAt)}
            </span>
            {(status === "ANALYZING" ||
              status === "TRANSCRIBING" ||
              progress) && (
              <span className="text-xs font-semibold text-primary">
                {status === "ANALYZING" || status === "TRANSCRIBING"
                  ? stage === "DIARIZE"
                    ? "Diarizing"
                    : stage === "EMBED"
                      ? "Embedding"
                      : stage === "ANALYZE"
                        ? "Analyzing"
                        : stage === "TRANSCRIBE"
                          ? "Transcribing"
                          : "Processing"
                  : progress
                    ? `${progress}%`
                    : ""}
              </span>
            )}
          </div>
        </div>
        {(status === "ANALYZING" || status === "TRANSCRIBING" || progress) && (
          <Progress
            value={progress}
            indicatorClassName={cn(
              (status === "ANALYZING" || status === "TRANSCRIBING") &&
                "bg-primary/50"
            )}
          />
        )}
      </div>
      {progress && (
        <Button
          variant="ghost"
          className="h-9 w-9 rounded-full"
          onClick={cancelUpload}
        >
          <CloseCircle />
        </Button>
      )}
      {status !== "ANALYZING" &&
        status !== "PENDING_UPLOAD" &&
        status !== "UPLOADED" &&
        status !== "TRANSCRIBING" && (
          <Badge variant="outline" className="w-fit px-1 md:px-2">
            <span>
              <CheckCircle />
            </span>
            <span className="hidden capitalize md:block">{status}</span>
          </Badge>
        )}
    </div>
  )
}
