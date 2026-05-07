CREATE TABLE "meeting_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"meetingId" text NOT NULL,
	"externalId" text,
	"name" text,
	"email" text,
	"isHost" boolean,
	"platform" text,
	"extraData" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_transcript_raw" (
	"id" text PRIMARY KEY NOT NULL,
	"meetingId" text NOT NULL,
	"provider" text NOT NULL,
	"payload" jsonb NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcript_word" (
	"id" text PRIMARY KEY NOT NULL,
	"segmentId" text NOT NULL,
	"text" text NOT NULL,
	"startMs" integer NOT NULL,
	"endMs" integer NOT NULL,
	"position" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transcript_segment" RENAME COLUMN "speaker" TO "participantId";--> statement-breakpoint
ALTER TABLE "transcript_segment" ADD COLUMN "languageCode" text;--> statement-breakpoint
ALTER TABLE "meeting_participant" ADD CONSTRAINT "meeting_participant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."meeting"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "meeting_transcript_raw" ADD CONSTRAINT "meeting_transcript_raw_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."meeting"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transcript_word" ADD CONSTRAINT "transcript_word_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "public"."transcript_segment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "meeting_participant_meetingId_externalId_key" ON "meeting_participant" USING btree ("meetingId" text_ops,"externalId" text_ops);--> statement-breakpoint
CREATE INDEX "meeting_participant_meetingId_idx" ON "meeting_participant" USING btree ("meetingId" text_ops);--> statement-breakpoint
CREATE INDEX "meeting_participant_meetingId_externalId_idx" ON "meeting_participant" USING btree ("meetingId" text_ops,"externalId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "meeting_transcript_raw_meetingId_key" ON "meeting_transcript_raw" USING btree ("meetingId" text_ops);--> statement-breakpoint
CREATE INDEX "transcript_word_segmentId_position_idx" ON "transcript_word" USING btree ("segmentId" text_ops,"position" int4_ops);--> statement-breakpoint
CREATE INDEX "transcript_word_segmentId_startMs_idx" ON "transcript_word" USING btree ("segmentId" text_ops,"startMs" int4_ops);--> statement-breakpoint
CREATE INDEX "transcript_segment_participantId_idx" ON "transcript_segment" USING btree ("participantId" text_ops);