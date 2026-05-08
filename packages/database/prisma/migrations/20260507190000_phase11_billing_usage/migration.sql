-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('STARTER', 'STUDIO_PRO');

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "plan" "WorkspacePlan" NOT NULL DEFAULT 'STARTER',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionPeriodEnd" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "usage_counter" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "minutesTranscribed" INTEGER NOT NULL DEFAULT 0,
    "meetingsTranscribed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_counter_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "meeting" ADD COLUMN     "billingUsageRecorded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "workspace_stripeCustomerId_key" ON "workspace"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_stripeSubscriptionId_key" ON "workspace"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "usage_counter_workspaceId_period_idx" ON "usage_counter"("workspaceId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "usage_counter_workspaceId_period_key" ON "usage_counter"("workspaceId", "period");

-- AddForeignKey
ALTER TABLE "usage_counter" ADD CONSTRAINT "usage_counter_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
