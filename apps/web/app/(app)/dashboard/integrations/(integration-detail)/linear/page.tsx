import { Suspense } from "react";
import { IntegrationLinearDetail } from "./_components/integration-linear-detail";

export default function IntegrationLinearPage() {
    return (
        <Suspense>
            <IntegrationLinearDetail />
        </Suspense>
    )
}
