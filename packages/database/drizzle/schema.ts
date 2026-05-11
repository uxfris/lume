import { pgTable, foreignKey, text, timestamp, varchar, integer, index, uniqueIndex, boolean, jsonb, vector, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const meetingPlatform = pgEnum("MeetingPlatform", ['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER'])
export const meetingSource = pgEnum("MeetingSource", ['UPLOAD', 'BOT'])
export const meetingStatus = pgEnum("MeetingStatus", ['PENDING_UPLOAD', 'UPLOADED', 'TRANSCRIBING', 'TRANSCRIBED', 'ANALYZING', 'SUMMARIZED', 'FAILED', 'SCHEDULED', 'LIVE'])
export const processingEventStatus = pgEnum("ProcessingEventStatus", ['STARTED', 'SUCCEEDED', 'FAILED'])
export const processingStage = pgEnum("ProcessingStage", ['TRANSCRIBE', 'DIARIZE', 'ANALYZE', 'EMBED'])
export const workspacePlan = pgEnum("WorkspacePlan", ['STARTER', 'STUDIO_PRO'])
export const workspaceRole = pgEnum("WorkspaceRole", ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'])


export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ precision: 3, mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ precision: 3, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const workspaceMember = pgTable("workspace_member", {
	id: text().primaryKey().notNull(),
	workspaceId: text().notNull(),
	userId: text().notNull(),
	role: workspaceRole().default('MEMBER').notNull(),
	joinedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("workspace_member_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("workspace_member_workspaceId_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	uniqueIndex("workspace_member_workspaceId_userId_key").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "workspace_member_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "workspace_member_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
	updatedAt: timestamp({ precision: 3, mode: 'string' }),
});

export const invitation = pgTable("invitation", {
	id: text().primaryKey().notNull(),
	workspaceId: text().notNull(),
	email: text().notNull(),
	role: workspaceRole().default('MEMBER').notNull(),
	tokenHash: text().notNull(),
	invitedByUserId: text().notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	acceptedAt: timestamp({ precision: 3, mode: 'string' }),
	revokedAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("invitation_tokenHash_key").using("btree", table.tokenHash.asc().nullsLast().op("text_ops")),
	uniqueIndex("invitation_workspaceId_email_key").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	index("invitation_workspaceId_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "invitation_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.invitedByUserId],
			foreignColumns: [user.id],
			name: "invitation_invitedByUserId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("user_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("user_id_idx").using("btree", table.id.asc().nullsLast().op("text_ops")),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => [
	index("session_expiresAt_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	uniqueIndex("session_token_key").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const processingEvent = pgTable("processing_event", {
	id: text().primaryKey().notNull(),
	meetingId: text().notNull(),
	stage: processingStage().notNull(),
	status: processingEventStatus().notNull(),
	message: text(),
	metadata: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("processing_event_meetingId_createdAt_idx").using("btree", table.meetingId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meeting.id],
			name: "processing_event_meetingId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const task = pgTable("task", {
	id: text().primaryKey().notNull(),
	workspaceId: text().notNull(),
	meetingId: text(),
	title: text().notNull(),
	assigneeId: text(),
	isCompleted: boolean().default(false).notNull(),
	dueAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("task_meetingId_idx").using("btree", table.meetingId.asc().nullsLast().op("text_ops")),
	index("task_workspaceId_isCompleted_createdAt_idx").using("btree", table.workspaceId.asc().nullsLast().op("timestamp_ops"), table.isCompleted.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "task_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meeting.id],
			name: "task_meetingId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.assigneeId],
			foreignColumns: [user.id],
			name: "task_assigneeId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const meeting = pgTable("meeting", {
	id: text().primaryKey().notNull(),
	workspaceId: text().notNull(),
	userId: text().notNull(),
	title: text().notNull(),
	source: meetingSource().default('UPLOAD').notNull(),
	status: meetingStatus().default('PENDING_UPLOAD').notNull(),
	audioKey: text(),
	fileName: text(),
	fileType: text(),
	fileSize: integer(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	durationSeconds: integer(),
	language: text(),
	summary: jsonb(),
	deletedAt: timestamp({ precision: 3, mode: 'string' }),
	isShared: boolean().default(false).notNull(),
	meetingUrl: text(),
	platform: meetingPlatform(),
	externalBotId: text(),
	scheduledAt: timestamp({ precision: 3, mode: 'string' }),
	billingUsageRecorded: boolean().default(false).notNull(),
	isStarred: boolean().default(false).notNull(),
}, (table) => [
	uniqueIndex("meeting_audioKey_key").using("btree", table.audioKey.asc().nullsLast().op("text_ops")),
	uniqueIndex("meeting_externalBotId_key").using("btree", table.externalBotId.asc().nullsLast().op("text_ops")),
	index("meeting_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("meeting_workspaceId_createdAt_idx").using("btree", table.workspaceId.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("meeting_workspaceId_deletedAt_createdAt_idx").using("btree", table.workspaceId.asc().nullsLast().op("timestamp_ops"), table.deletedAt.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "meeting_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "meeting_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const meetingChunk = pgTable("meeting_chunk", {
	id: text().primaryKey().notNull(),
	meetingId: text().notNull(),
	content: text().notNull(),
	startMs: integer().notNull(),
	endMs: integer().notNull(),
	embedding: vector({ dimensions: 1536 }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("meeting_chunk_meetingId_idx").using("btree", table.meetingId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meeting.id],
			name: "meeting_chunk_meetingId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const failedWebhook = pgTable("failed_webhook", {
	id: text().primaryKey().notNull(),
	provider: text().notNull(),
	eventType: text(),
	payload: jsonb().notNull(),
	error: text().notNull(),
	attempts: integer().default(1).notNull(),
	externalBotId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("failed_webhook_externalBotId_idx").using("btree", table.externalBotId.asc().nullsLast().op("text_ops")),
	index("failed_webhook_provider_createdAt_idx").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
]);

export const transcriptSegment = pgTable("transcript_segment", {
	id: text().primaryKey().notNull(),
	meetingId: text().notNull(),
	startMs: integer().notNull(),
	endMs: integer().notNull(),
	text: text().notNull(),
	index: integer().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	languageCode: text(),
	participantId: text(),
}, (table) => [
	uniqueIndex("transcript_segment_meetingId_index_key").using("btree", table.meetingId.asc().nullsLast().op("int4_ops"), table.index.asc().nullsLast().op("int4_ops")),
	index("transcript_segment_meetingId_startMs_idx").using("btree", table.meetingId.asc().nullsLast().op("text_ops"), table.startMs.asc().nullsLast().op("int4_ops")),
	index("transcript_segment_participantId_idx").using("btree", table.participantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meeting.id],
			name: "transcript_segment_meetingId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.participantId],
			foreignColumns: [meetingParticipant.id],
			name: "transcript_segment_participantId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const recallCalendarConnection = pgTable("recall_calendar_connection", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	provider: text().notNull(),
	recallCalendarId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("recall_calendar_connection_userId_provider_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.provider.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "recall_calendar_connection_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const workspace = pgTable("workspace", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	plan: workspacePlan().default('STARTER').notNull(),
	stripeCustomerId: text(),
	stripeSubscriptionId: text(),
	subscriptionPeriodEnd: timestamp({ precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("workspace_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	uniqueIndex("workspace_stripeCustomerId_key").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	uniqueIndex("workspace_stripeSubscriptionId_key").using("btree", table.stripeSubscriptionId.asc().nullsLast().op("text_ops")),
]);

export const meetingParticipant = pgTable("meeting_participant", {
	id: text().primaryKey().notNull(),
	meetingId: text().notNull(),
	externalId: text(),
	name: text(),
	email: text(),
	isHost: boolean(),
	platform: text(),
	extraData: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("meeting_participant_meetingId_externalId_idx").using("btree", table.meetingId.asc().nullsLast().op("text_ops"), table.externalId.asc().nullsLast().op("text_ops")),
	uniqueIndex("meeting_participant_meetingId_externalId_key").using("btree", table.meetingId.asc().nullsLast().op("text_ops"), table.externalId.asc().nullsLast().op("text_ops")),
	index("meeting_participant_meetingId_idx").using("btree", table.meetingId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meeting.id],
			name: "meeting_participant_meetingId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const transcriptWord = pgTable("transcript_word", {
	id: text().primaryKey().notNull(),
	segmentId: text().notNull(),
	text: text().notNull(),
	startMs: integer().notNull(),
	endMs: integer().notNull(),
	position: integer().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("transcript_word_segmentId_position_idx").using("btree", table.segmentId.asc().nullsLast().op("int4_ops"), table.position.asc().nullsLast().op("int4_ops")),
	index("transcript_word_segmentId_startMs_idx").using("btree", table.segmentId.asc().nullsLast().op("int4_ops"), table.startMs.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.segmentId],
			foreignColumns: [transcriptSegment.id],
			name: "transcript_word_segmentId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const meetingTranscriptRaw = pgTable("meeting_transcript_raw", {
	id: text().primaryKey().notNull(),
	meetingId: text().notNull(),
	provider: text().notNull(),
	payload: jsonb().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("meeting_transcript_raw_meetingId_key").using("btree", table.meetingId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meeting.id],
			name: "meeting_transcript_raw_meetingId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const calendarEvent = pgTable("calendar_event", {
	id: text().primaryKey().notNull(),
	workspaceId: text().notNull(),
	userId: text().notNull(),
	provider: text().notNull(),
	externalId: text().notNull(),
	title: text().notNull(),
	startAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	endAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	joinUrl: text(),
	platform: meetingPlatform(),
	attendees: jsonb(),
	metadata: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	calendarUrl: text().notNull(),
}, (table) => [
	index("calendar_event_userId_startAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.startAt.asc().nullsLast().op("timestamp_ops")),
	index("calendar_event_workspaceId_startAt_idx").using("btree", table.workspaceId.asc().nullsLast().op("timestamp_ops"), table.startAt.asc().nullsLast().op("text_ops")),
	uniqueIndex("calendar_event_workspaceId_userId_provider_externalId_key").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops"), table.provider.asc().nullsLast().op("text_ops"), table.externalId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "calendar_event_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "calendar_event_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const usageCounter = pgTable("usage_counter", {
	id: text().primaryKey().notNull(),
	workspaceId: text().notNull(),
	period: text().notNull(),
	minutesTranscribed: integer().default(0).notNull(),
	meetingsTranscribed: integer().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("usage_counter_workspaceId_period_idx").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.period.asc().nullsLast().op("text_ops")),
	uniqueIndex("usage_counter_workspaceId_period_key").using("btree", table.workspaceId.asc().nullsLast().op("text_ops"), table.period.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workspaceId],
			foreignColumns: [workspace.id],
			name: "usage_counter_workspaceId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);
