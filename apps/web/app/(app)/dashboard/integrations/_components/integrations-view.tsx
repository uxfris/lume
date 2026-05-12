import { Integration } from "@workspace/types"
import { IntegrationItem } from "./integration-item"
import Link from "next/link"
import { routes } from "@/lib/routes"

export function IntegrationsView({
  integrations,
}: {
  integrations: Integration[]
}) {
  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pt-6 pb-20 md:px-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          if (integration.status === "coming soon") {
            return (
              <IntegrationItem key={integration.id} integration={integration} />
            )
          }
          return (
            <Link
              key={integration.id}
              href={routes.dashboard.integrations.detail(integration.id)}
            >
              <IntegrationItem integration={integration} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
