CREATE TABLE "recall_calendar_connection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "recallCalendarId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recall_calendar_connection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "recall_calendar_connection_userId_provider_key"
ON "recall_calendar_connection"("userId", "provider");

ALTER TABLE "recall_calendar_connection" ADD CONSTRAINT "recall_calendar_connection_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
