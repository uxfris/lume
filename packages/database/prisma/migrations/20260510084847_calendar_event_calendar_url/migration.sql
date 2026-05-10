-- AlterTable: existing rows need a value before NOT NULL without server default.
ALTER TABLE "calendar_event" ADD COLUMN "calendarUrl" TEXT NOT NULL DEFAULT '';

UPDATE "calendar_event" SET "calendarUrl" = COALESCE("joinUrl", '');

ALTER TABLE "calendar_event" ALTER COLUMN "calendarUrl" DROP DEFAULT;
