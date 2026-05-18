import Link from "next/link"
import { Check, Minus } from "lucide-react"
import { routes } from "@/lib/routes"
import { MarketingSection } from "../marketing-section"
import { PRICING_COPY } from "../../_lib/pricing-copy"
import { cn } from "@workspace/ui/lib/utils"

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>
  }
  return value ? (
    <Check className="mx-auto size-4 text-primary" aria-label="Included" />
  ) : (
    <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not included" />
  )
}

export function PricingCompareTable() {
  const { compare } = PRICING_COPY

  return (
    <MarketingSection
      label={compare.label}
      headline={compare.headline}
      className="bg-muted/30"
    >
      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
        <table className="w-full min-w-[540px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-4 py-3 font-medium text-muted-foreground" scope="col">
                Feature
              </th>
              <th className="px-4 py-3 text-center font-semibold" scope="col">
                Starter
              </th>
              <th className="px-4 py-3 text-center font-semibold" scope="col">
                Studio Pro
              </th>
              <th className="px-4 py-3 text-center font-semibold" scope="col">
                Business
              </th>
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-4 py-3 font-medium">{row.label}</td>
                <td className={cn("px-4 py-3 text-center")}>
                  <CellValue value={row.starter} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CellValue value={row.pro} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CellValue value={row.business} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
        {compare.footnote}{" "}
        <Link
          href={routes.term}
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Terms
        </Link>
        .
      </p>
    </MarketingSection>
  )
}
