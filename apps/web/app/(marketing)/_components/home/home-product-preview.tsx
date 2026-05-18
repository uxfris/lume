import { MeetingDocumentPreview } from "../shared/meeting-document-preview"

type HomeProductPreviewProps = {
  variant?: "hero" | "section"
}

export function HomeProductPreview({ variant = "section" }: HomeProductPreviewProps) {
  return (
    <MeetingDocumentPreview
      variant={variant}
      className={variant === "hero" ? "mx-auto" : undefined}
    />
  )
}
