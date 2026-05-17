-- AlterTable
ALTER TABLE "user" ADD COLUMN "scheduledDeletionAt" TIMESTAMP(3),
ADD COLUMN "deletionReason" TEXT;

-- CreateIndex
CREATE INDEX "user_scheduledDeletionAt_idx" ON "user"("scheduledDeletionAt");
