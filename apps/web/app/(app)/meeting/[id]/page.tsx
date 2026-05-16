import { MeetingDocumentToolbar } from "./_components/meeting-document-toolbar"
import { MeetingDocumentHeader } from "./_components/meeting-document-header"
import { MeetingDocumentOverview } from "./_components/meeting-document-overview"
import { MeetingDocumentTakeaway } from "./_components/meeting-document-takeaway"
import { MeetingDocumentActionItem } from "./_components/meeting-document-action-item"
import { MeetingDocumentTranscript } from "./_components/meeting-document-transcript"
import { MeetingMediaPlayerBar } from "./_components/meeting-media-player-bar"
import { meetingApi } from "@workspace/api-client"
import { getServerApiFetchOptions } from "@/lib/server-api"
import { notFound } from "next/navigation"
import { MeetingEditor } from "./_components/editor/meeting-editor"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const { id } = await params
  const { cookie, workspaceId } = await getServerApiFetchOptions()

  let meeting
  try {
    meeting = await meetingApi.getMeeting(id, { cookie, workspaceId })
  } catch {
    notFound()
  }

  return (
    <main className="bg-card px-4 pt-24 md:px-6">
      <div className="mx-auto max-w-[700px] space-y-12">
        <header>
          <MeetingDocumentToolbar meeting={meeting} />
          {/* <MeetingDocumentHeader meeting={meeting} /> */}
        </header>
        <MeetingEditor meeting={meeting} />
        {/* <MeetingDocumentOverview meeting={meeting} /> */}
        {/* <MeetingDocumentTakeaway meeting={meeting} /> */}
        <MeetingDocumentActionItem meetingId={meeting.id} />
        <MeetingDocumentTranscript />
        <MeetingMediaPlayerBar />
      </div>
    </main>
  )
}
