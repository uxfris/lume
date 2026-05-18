"use client"

import { Integration } from "@workspace/types"
import { IntegrationItem } from "./integration-item"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { useIntegrationListSearch } from "../_stores/integration-list-search-store"
import { useIntegrationListCategory } from "../_stores/integration-list-category-store"
import { useIntegrationListStatus } from "../_stores/integration-list-status-store"
import { useIntegrationListView } from "../_stores/integration-list-view-store"
import { filterIntegrations } from "../_lib/filter-integrations"
import { cn } from "@workspace/ui/lib/utils"

export function IntegrationsView({
  integrations,
}: {
  integrations: Integration[]
}) {
  const searchQuery = useIntegrationListSearch((s) => s.searchQuery)
  const category = useIntegrationListCategory((s) => s.category)
  const status = useIntegrationListStatus((s) => s.status)
  const view = useIntegrationListView((s) => s.view)

  const filtered = filterIntegrations(integrations, {
    searchQuery,
    category,
    status,
  })

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pt-6 pb-20 md:px-10">
      <div
        className={cn(
          view === "grid"
            ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-3"
        )}
      >
        {filtered.map((integration) => {
          if (integration.status === "coming soon") {
            return (
              <IntegrationItem
                key={integration.id}
                integration={integration}
                variant={view}
              />
            )
          }
          return (
            <Link
              key={integration.id}
              href={routes.dashboard.integrations.detail(integration.id)}
            >
              <IntegrationItem integration={integration} variant={view} />
            </Link>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No integrations match your filters.
        </p>
      )}
    </div>
  )
}
