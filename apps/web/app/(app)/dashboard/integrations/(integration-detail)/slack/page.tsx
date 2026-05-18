import { Suspense } from "react";
import { IntegrationSlackDetail } from "./_components/integration-slack-detail";

export default function IntegrationSlackPage() {
    return (
        <Suspense>
            <IntegrationSlackDetail />
        </Suspense>
    )
}
