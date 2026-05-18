"use client"

import { LinkMinimalistic } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useState } from "react"

export function FetchFromLink({
  onFetchFromLink,
}: {
  onFetchFromLink: (url: string) => Promise<unknown>
}) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const trimmed = url.trim()
    if (!trimmed || loading) return

    setLoading(true)
    try {
      await onFetchFromLink(trimmed)
      setUrl("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 rounded-md bg-secondary p-6 md:flex-2">
      <div className="space-y-4 md:flex-1">
        <div className="flex items-center gap-2">
          <LinkMinimalistic size={20} />
          <h2 className="text-lg font-semibold">Remote Source</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Import directly from Cloud Storage or secure CAD URLs.
        </p>
      </div>
      <div className="space-y-4">
        <Field>
          <FieldLabel>SOURCE URL</FieldLabel>
          <Input
            className="bg-secondary brightness-95 h-12"
            placeholder="https://cloud.lume.io/share/..."
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void handleSubmit()
              }
            }}
            disabled={loading}
          />
        </Field>
        <Button
          variant="outline"
          size="xl"
          className="brightness-90 w-full"
          onClick={() => void handleSubmit()}
          disabled={loading || url.trim().length === 0}
        >
          {loading ? "Fetching..." : "Fetch from Link"}
        </Button>
      </div>
    </div>
  )
}
