import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { CircleCheck } from "lucide-react";
import Image from "next/image";
import { Integration } from "@workspace/types";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

export function IntegrationItem({
  integration,
  variant = "grid",
}: {
  integration: Integration
  variant?: "grid" | "list"
}) {
    return (
        <Card
          className={cn(
            "flex h-full",
            variant === "list" ? "flex-row items-center" : "flex-col",
            integration.status !== "coming soon"
              ? "cursor-pointer hover:bg-secondary"
              : "cursor-not-allowed"
          )}
        >
            <CardContent
              className={cn(
                "flex gap-6 px-6 py-2 h-full w-full",
                variant === "list" ? "flex-row items-center" : "flex-col"
              )}
            >
                <div className="flex justify-between">
                    <Image src={integration.logo} alt={integration.name} width={48} height={48} />
                    {integration.status !== "disconnected" &&
                        <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                            {integration.status === "connected" && <CircleCheck />}
                            <span>{integration.status}</span>
                        </Badge>}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">
                        {integration.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {integration.description}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}