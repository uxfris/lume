import { Bolt, CloudUpload, Magnifier, Star, UsersGroupRounded } from "@solar-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { MeetingDocumentPreview } from "../shared/meeting-document-preview"
import { PRODUCT_COPY } from "../../_lib/product-copy"

export function LiveSyncVisual() {
  const { liveSync } = PRODUCT_COPY

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-lg md:p-8">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Live Sync</h3>
        <p className="text-sm text-muted-foreground">
          Add the Lume assistant to your current active meeting.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          readOnly
          placeholder={liveSync.placeholder}
          className="h-12 bg-muted/30"
          defaultValue="https://meet.google.com/abc-defg-hij"
        />
        <Button size="xl" className="shrink-0 gap-2" type="button" tabIndex={-1}>
          <Bolt />
          Join Now
        </Button>
      </div>
    </div>
  )
}

export function UploadVisual() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-lg md:p-12">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
        <CloudUpload className="size-6 text-primary" />
      </div>
      <p className="mt-4 font-medium">Drop your recording here</p>
      <p className="mt-1 text-sm text-muted-foreground">
        MP4, MOV, MP3, WAV — or click to browse
      </p>
      <Button variant="outline" className="mt-6" type="button" tabIndex={-1}>
        Choose file
      </Button>
    </div>
  )
}

export function MeetingDocumentVisual() {
  const { meetingDocument } = PRODUCT_COPY

  return (
    <div className="relative">
      <MeetingDocumentPreview variant="compact" className="mx-auto shadow-lg" />
      <ul className="mt-6 grid gap-2 sm:grid-cols-3">
        {meetingDocument.callouts.map((callout) => (
          <li
            key={callout.label}
            className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-center"
          >
            <p className="text-xs font-semibold">{callout.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{callout.copy}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ActionItemsVisual() {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card p-5 shadow-lg">
      <p className="text-sm font-semibold">Action items</p>
      {[
        { task: "Ship Linear sync to production", owner: "Jordan", synced: true },
        { task: "Update onboarding copy", owner: "Alex", synced: false },
        { task: "Review security page draft", owner: "Sam", synced: false },
      ].map((item) => (
        <div
          key={item.task}
          className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5"
        >
          <span
            className={cn(
              "size-4 shrink-0 rounded border",
              item.synced ? "border-primary bg-primary" : "border-muted-foreground/40"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{item.task}</p>
            <p className="text-xs text-muted-foreground">{item.owner}</p>
          </div>
          {item.synced ? (
            <span className="shrink-0 text-xs font-medium text-primary">In Linear</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function SearchVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
      <div className="border-b border-border/60 p-4">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
          <Magnifier className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">sprint planning decisions</span>
        </div>
      </div>
      <ul className="divide-y divide-border/60 p-2">
        {[
          {
            title: "Sprint planning — Product sync",
            snippet: "…aligned on shipping Live Sync improvements and Linear task sync…",
            date: "Mar 12",
          },
          {
            title: "Weekly standup",
            snippet: "…Jordan to QA Linear sync on staging before Thursday…",
            date: "Mar 10",
          },
        ].map((result) => (
          <li key={result.title} className="rounded-md px-3 py-3 hover:bg-muted/40">
            <p className="text-sm font-medium">{result.title}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {result.snippet}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{result.date}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function WorkspacesVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-sm font-semibold">Acme Workspace</p>
      </div>
      <ul className="p-2">
        {[
          { label: "All meetings", icon: null, active: false },
          { label: "Starred", icon: Star, active: false },
          { label: "Product", icon: null, active: true, count: 12 },
          { label: "Sales", icon: null, active: false, count: 8 },
        ].map((item) => (
          <li
            key={item.label}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              item.active && "bg-primary/10 text-primary"
            )}
          >
            {item.icon ? <item.icon className="size-4" /> : <UsersGroupRounded className="size-4 opacity-60" />}
            <span className="flex-1">{item.label}</span>
            {item.count ? (
              <span className="text-xs text-muted-foreground">{item.count}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
