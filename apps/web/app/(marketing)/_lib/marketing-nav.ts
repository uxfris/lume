import { routes } from "@/lib/routes"

export const MARKETING_NAV = [
  { label: "Product", href: routes.marketing.product },
  { label: "Integrations", href: routes.marketing.integrations },
  { label: "Pricing", href: routes.marketing.pricing },
] as const
