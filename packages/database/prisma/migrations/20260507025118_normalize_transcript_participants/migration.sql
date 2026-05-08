/*
  Warnings:

  - You are about to drop the column `speaker` on the `transcript_segment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transcript_segment" DROP COLUMN "speaker",
ADD COLUMN     "languageCode" TEXT,
ADD COLUMN     "participantId" TEXT;

-- CreateTable
CREATE TABLE "meeting_participant" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "isHost" BOOLEAN,
    "platform" TEXT,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript_word" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcript_word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_transcript_raw" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_transcript_raw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meeting_participant_meetingId_idx" ON "meeting_participant"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_participant_meetingId_externalId_idx" ON "meeting_participant"("meetingId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_participant_meetingId_externalId_key" ON "meeting_participant"("meetingId", "externalId");

-- CreateIndex
CREATE INDEX "transcript_word_segmentId_position_idx" ON "transcript_word"("segmentId", "position");

-- CreateIndex
CREATE INDEX "transcript_word_segmentId_startMs_idx" ON "transcript_word"("segmentId", "startMs");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_transcript_raw_meetingId_key" ON "meeting_transcript_raw"("meetingId");

-- CreateIndex
CREATE INDEX "transcript_segment_participantId_idx" ON "transcript_segment"("participantId");

-- AddForeignKey
ALTER TABLE "meeting_participant" ADD CONSTRAINT "meeting_participant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript_segment" ADD CONSTRAINT "transcript_segment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "meeting_participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript_word" ADD CONSTRAINT "transcript_word_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "transcript_segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_transcript_raw" ADD CONSTRAINT "meeting_transcript_raw_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
