import { relations } from "drizzle-orm/relations";
import { user, account, workspace, workspaceMember, invitation, session, meeting, processingEvent, task, meetingChunk, transcriptSegment, meetingParticipant, recallCalendarConnection, transcriptWord, meetingTranscriptRaw, calendarEvent, usageCounter } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	workspaceMembers: many(workspaceMember),
	invitations: many(invitation),
	sessions: many(session),
	tasks: many(task),
	meetings: many(meeting),
	recallCalendarConnections: many(recallCalendarConnection),
	calendarEvents: many(calendarEvent),
}));

export const workspaceMemberRelations = relations(workspaceMember, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspaceMember.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [workspaceMember.userId],
		references: [user.id]
	}),
}));

export const workspaceRelations = relations(workspace, ({many}) => ({
	workspaceMembers: many(workspaceMember),
	invitations: many(invitation),
	tasks: many(task),
	meetings: many(meeting),
	calendarEvents: many(calendarEvent),
	usageCounters: many(usageCounter),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	workspace: one(workspace, {
		fields: [invitation.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [invitation.invitedByUserId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const processingEventRelations = relations(processingEvent, ({one}) => ({
	meeting: one(meeting, {
		fields: [processingEvent.meetingId],
		references: [meeting.id]
	}),
}));

export const meetingRelations = relations(meeting, ({one, many}) => ({
	processingEvents: many(processingEvent),
	tasks: many(task),
	workspace: one(workspace, {
		fields: [meeting.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [meeting.userId],
		references: [user.id]
	}),
	meetingChunks: many(meetingChunk),
	transcriptSegments: many(transcriptSegment),
	meetingParticipants: many(meetingParticipant),
	meetingTranscriptRaws: many(meetingTranscriptRaw),
}));

export const taskRelations = relations(task, ({one}) => ({
	workspace: one(workspace, {
		fields: [task.workspaceId],
		references: [workspace.id]
	}),
	meeting: one(meeting, {
		fields: [task.meetingId],
		references: [meeting.id]
	}),
	user: one(user, {
		fields: [task.assigneeId],
		references: [user.id]
	}),
}));

export const meetingChunkRelations = relations(meetingChunk, ({one}) => ({
	meeting: one(meeting, {
		fields: [meetingChunk.meetingId],
		references: [meeting.id]
	}),
}));

export const transcriptSegmentRelations = relations(transcriptSegment, ({one, many}) => ({
	meeting: one(meeting, {
		fields: [transcriptSegment.meetingId],
		references: [meeting.id]
	}),
	meetingParticipant: one(meetingParticipant, {
		fields: [transcriptSegment.participantId],
		references: [meetingParticipant.id]
	}),
	transcriptWords: many(transcriptWord),
}));

export const meetingParticipantRelations = relations(meetingParticipant, ({one, many}) => ({
	transcriptSegments: many(transcriptSegment),
	meeting: one(meeting, {
		fields: [meetingParticipant.meetingId],
		references: [meeting.id]
	}),
}));

export const recallCalendarConnectionRelations = relations(recallCalendarConnection, ({one}) => ({
	user: one(user, {
		fields: [recallCalendarConnection.userId],
		references: [user.id]
	}),
}));

export const transcriptWordRelations = relations(transcriptWord, ({one}) => ({
	transcriptSegment: one(transcriptSegment, {
		fields: [transcriptWord.segmentId],
		references: [transcriptSegment.id]
	}),
}));

export const meetingTranscriptRawRelations = relations(meetingTranscriptRaw, ({one}) => ({
	meeting: one(meeting, {
		fields: [meetingTranscriptRaw.meetingId],
		references: [meeting.id]
	}),
}));

export const calendarEventRelations = relations(calendarEvent, ({one}) => ({
	workspace: one(workspace, {
		fields: [calendarEvent.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [calendarEvent.userId],
		references: [user.id]
	}),
}));

export const usageCounterRelations = relations(usageCounter, ({one}) => ({
	workspace: one(workspace, {
		fields: [usageCounter.workspaceId],
		references: [workspace.id]
	}),
}));