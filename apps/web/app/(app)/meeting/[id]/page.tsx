import { MeetingDocumentToolbar } from "./_components/meeting-document-toolbar"
import { MeetingDocumentHeader } from "./_components/meeting-document-header"
import { meetingApi } from "@workspace/api-client"
import { getServerApiFetchOptions } from "@/lib/server-api"
import { notFound } from "next/navigation"
import { MeetingBody } from "./_components/meeting-document"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MeetingDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  console.log("👉 VERCEL RECEIVED PARAMS:", resolvedParams)

  const id = resolvedParams.id // or resolvedParams.meetingId depending on folder name

  if (!id || id === "undefined") {
    console.error("❌ Aborting fetch: ID is missing or undefined!")
    notFound()
  }

  const { cookie, workspaceId } = await getServerApiFetchOptions()

  let meeting
  try {
    meeting = await meetingApi.getMeeting(id, { cookie, workspaceId })
  } catch {
    notFound()
  }

  return (
    <main className="min-h-screen bg-card px-4 pt-24 md:px-6">
      <div className="mx-auto max-w-[700px] space-y-12">
        <header>
          <MeetingDocumentToolbar meeting={meeting} />
          <MeetingDocumentHeader meeting={meeting} />
        </header>
        <MeetingBody meeting={meeting} />
      </div>
    </main>
  )
}
