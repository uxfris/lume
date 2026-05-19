"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import type { UploadSummary } from "@workspace/types"
import Link from "next/link"
import { UploadEmpty } from "./upload-empty"
import { RecentUploadItem } from "./recent-upload-item"
import { routes } from "@/lib/routes"

export function RecentUploads({
  uploads,
  progressByMeetingId,
  stageByMeetingId,
  loading,
}: {
  uploads: UploadSummary[]
  progressByMeetingId: Record<string, number>
  stageByMeetingId: Record<
    string,
    "TRANSCRIBE" | "DIARIZE" | "ANALYZE" | "EMBED"
  >
  loading?: boolean
}) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Queue & Recent Uploads</h2>
        {/* {uploads.length !== 0 && <Button variant="ghost">Clear History</Button>} */}
      </div>
      <Card className="px-0 py-2 md:px-2 md:py-3">
        <CardContent className="px-2">
          {!loading && uploads.length === 0 && <UploadEmpty />}
          {uploads.map((upload) => {
            const progress = progressByMeetingId[upload.meetingId]
            if (upload.status === "SUMMARIZED") {
              return (
                <Link
                  key={upload.meetingId}
                  href={routes.meeting(upload.meetingId)}
                >
                  <RecentUploadItem
                    item={upload}
                    progress={progress}
                    stage={stageByMeetingId[upload.meetingId]}
                  />
                </Link>
              )
            }
            return (
              <RecentUploadItem
                key={upload.meetingId}
                item={upload}
                progress={progress}
                stage={stageByMeetingId[upload.meetingId]}
                className="cursor-progress"
              />
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
