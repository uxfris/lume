"use client"

import { Upload } from "@solar-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { useRef } from "react"

export function UploadInput({
  onUploadFile,
}: {
  onUploadFile: (file: File) => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.currentTarget.value = ""
    if (!file) return

    onUploadFile(file)
  }

  return (
    <Card className="md:flex-5">
      <CardContent className="flex flex-5 flex-col items-center justify-center gap-8 py-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-md bg-secondary">
          <Upload weight="Bold" size={32} />
        </div>
        <div className="space-y-2 px-8">
          <h1 className="text-xl font-semibold md:text-2xl">
            Upload a file to generate a transcript
          </h1>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground md:text-sm">
              Browse MP3, M4A, WAV, MP4, or WEBM files
            </p>
            <p className="text-xs text-muted-foreground md:text-sm">
              Upload runs directly to storage, then queues processing
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="audio/*,video/*"
          onChange={handleSelectFile}
        />
        <Button size="xl" onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>
      </CardContent>
    </Card>
  )
}
