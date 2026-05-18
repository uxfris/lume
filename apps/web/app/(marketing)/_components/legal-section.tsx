import type { LegalSection } from "../_lib/legal"

function BlockList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function BlockParagraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

export function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 border-b border-border/60 py-10 last:border-b-0"
    >
      <h2 className="text-base font-semibold tracking-tight">{section.title}</h2>

      {section.paragraphs && <BlockParagraphs paragraphs={section.paragraphs} />}

      {section.list && <BlockList items={section.list} />}

      {section.subsections?.map((subsection) => (
        <div key={subsection.title} className="mt-6">
          <h3 className="text-sm font-medium">{subsection.title}</h3>
          {subsection.paragraphs && (
            <BlockParagraphs paragraphs={subsection.paragraphs} />
          )}
          {subsection.list && <BlockList items={subsection.list} />}
        </div>
      ))}
    </section>
  )
}
