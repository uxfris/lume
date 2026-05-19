"use client"

import { FetchFromLink } from "./_components/fetch-from-link"
import { RecentUploads } from "./_components/recent-uploads"
import { UploadInput } from "./_components/upload-input"
import { useUpload } from "./_hooks/use-upload"

export default function Uploads() {
  const {
    handleUploadFile,
    handleFetchFromLink,
    displayUploads,
    progressByMeetingId,
    stageByMeetingId,
    loading,
    quotaExceededDialog,
  } = useUpload()
  return (
    <>
      {quotaExceededDialog}
      <div className="flex flex-col gap-8 overflow-y-auto px-4 pt-0 pb-12 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
          <UploadInput onUploadFile={handleUploadFile} />
          {/* <FetchFromLink onFetchFromLink={handleFetchFromLink} /> */}
        </div>
        <RecentUploads
          uploads={displayUploads}
          progressByMeetingId={progressByMeetingId}
          stageByMeetingId={stageByMeetingId}
          loading={loading}
        />
      </div>
    </>
  )
}
