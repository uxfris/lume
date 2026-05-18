"use client"

import Link from "next/link"
import { routes } from "@/lib/routes"
import { MarketingFaq } from "../marketing-faq"
import { HOME_COPY } from "../../_lib/home-copy"

export function HomeFaq() {
  const { faq } = HOME_COPY

  return (
    <MarketingFaq
      id="faq"
      label={faq.label}
      headline={faq.headline}
      items={faq.items}
      className="bg-muted/30"
      renderAnswer={(item) => {
        if (item.question.includes("data used to train")) {
          return (
            <>
              We use third-party AI for transcription and analysis. See our{" "}
              <Link
                href={routes.privacy}
                className="text-foreground underline underline-offset-4"
              >
                Privacy Policy
              </Link>{" "}
              for what we send and how we handle your data.
            </>
          )
        }
        if (item.question.includes("free plan")) {
          return (
            <>
              Starter includes 5 meetings per month, AI summaries, search, and a
              single workspace. See{" "}
              <Link
                href={routes.marketing.pricing}
                className="text-foreground underline underline-offset-4"
              >
                Pricing
              </Link>{" "}
              for storage details.
            </>
          )
        }
        return item.answer
      }}
    />
  )
}
