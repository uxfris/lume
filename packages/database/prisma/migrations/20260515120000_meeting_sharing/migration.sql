-- CreateEnum
CREATE TYPE "MeetingShareRole" AS ENUM ('VIEWER', 'EDITOR');

-- CreateEnum
CREATE TYPE "MeetingGeneralAccess" AS ENUM ('RESTRICTED', 'WORKSPACE', 'LINK');

-- AlterTable
ALTER TABLE "meeting" ADD COLUMN "generalAccess" "MeetingGeneralAccess" NOT NULL DEFAULT 'RESTRICTED';

-- CreateTable
CREATE TABLE "meeting_share" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "role" "MeetingShareRole" NOT NULL DEFAULT 'VIEWER',
    "invitedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meeting_share_userId_idx" ON "meeting_share"("userId");

-- CreateIndex
CREATE INDEX "meeting_share_email_idx" ON "meeting_share"("email");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_share_meetingId_email_key" ON "meeting_share"("meetingId", "email");

-- AddForeignKey
ALTER TABLE "meeting_share" ADD CONSTRAINT "meeting_share_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_share" ADD CONSTRAINT "meeting_share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_share" ADD CONSTRAINT "meeting_share_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
