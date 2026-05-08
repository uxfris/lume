CREATE TABLE "calendar_event" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "joinUrl" TEXT,
    "platform" "MeetingPlatform",
    "attendees" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "calendar_event_workspaceId_userId_provider_externalId_key"
ON "calendar_event"("workspaceId", "userId", "provider", "externalId");

CREATE INDEX "calendar_event_workspaceId_startAt_idx"
ON "calendar_event"("workspaceId", "startAt");

CREATE INDEX "calendar_event_userId_startAt_idx"
ON "calendar_event"("userId", "startAt");

ALTER TABLE "calendar_event" ADD CONSTRAINT "calendar_event_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "calendar_event" ADD CONSTRAINT "calendar_event_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
