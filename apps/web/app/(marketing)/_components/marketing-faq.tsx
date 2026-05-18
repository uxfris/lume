"use client"

import { ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { cn } from "@workspace/ui/lib/utils"
import { MarketingSection } from "./marketing-section"

type FaqItem = {
  question: string
  answer: string
}

type MarketingFaqProps = {
  id?: string
  label: string
  headline: string
  items: readonly FaqItem[]
  className?: string
  renderAnswer?: (item: FaqItem) => React.ReactNode
}

export function MarketingFaq({
  id,
  label,
  headline,
  items,
  className,
  renderAnswer,
}: MarketingFaqProps) {
  return (
    <MarketingSection id={id} label={label} headline={headline} className={className}>
      <ul className="mx-auto max-w-2xl divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
        {items.map((item, index) => (
          <li key={item.question}>
            <Collapsible defaultOpen={index === 0}>
              <CollapsibleTrigger
                className={cn(
                  "group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors",
                  "hover:text-foreground data-[state=open]:text-foreground"
                )}
              >
                {item.question}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                {renderAnswer ? renderAnswer(item) : item.answer}
              </CollapsibleContent>
            </Collapsible>
          </li>
        ))}
      </ul>
    </MarketingSection>
  )
}
