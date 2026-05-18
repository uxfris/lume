-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('SLACK', 'LINEAR');

-- CreateEnum
CREATE TYPE "IntegrationActivityStatus" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "workspace_integration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "externalAccountId" TEXT,
    "externalAccountName" TEXT,
    "connectedByUserId" TEXT,
    "connectedAt" TIMESTAMP(3),
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_activity" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "meetingId" TEXT,
    "status" "IntegrationActivityStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_integration_workspaceId_idx" ON "workspace_integration"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_integration_workspaceId_provider_key" ON "workspace_integration"("workspaceId", "provider");

-- CreateIndex
CREATE INDEX "integration_activity_workspaceId_provider_createdAt_idx" ON "integration_activity"("workspaceId", "provider", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "workspace_integration" ADD CONSTRAINT "workspace_integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_activity" ADD CONSTRAINT "integration_activity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_activity" ADD CONSTRAINT "integration_activity_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
