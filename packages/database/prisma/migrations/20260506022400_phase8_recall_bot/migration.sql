-- AlterEnum
ALTER TYPE "MeetingStatus" ADD VALUE 'SCHEDULED';

-- CreateEnum
CREATE TYPE "MeetingPlatform" AS ENUM ('ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER');

-- AlterTable
ALTER TABLE "meeting"
  ADD COLUMN "meetingUrl" TEXT,
  ADD COLUMN "platform" "MeetingPlatform",
  ADD COLUMN "externalBotId" TEXT,
  ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "meeting_externalBotId_key" ON "meeting"("externalBotId");

-- CreateTable
CREATE TABLE "failed_webhook" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT,
    "payload" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "externalBotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "failed_webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "failed_webhook_provider_createdAt_idx" ON "failed_webhook"("provider", "createdAt");

-- CreateIndex
CREATE INDEX "failed_webhook_externalBotId_idx" ON "failed_webhook"("externalBotId");
