import { relations } from "drizzle-orm/relations";
import { meeting, meetingParticipant, workspace, calendarEvent, user, recallCalendarConnection, invitation, processingEvent, account, session, workspaceMember, transcriptSegment, transcriptWord, meetingTranscriptRaw, meetingChunk, task } from "./schema";

export const meetingParticipantRelations = relations(meetingParticipant, ({one, many}) => ({
	meeting: one(meeting, {
		fields: [meetingParticipant.meetingId],
		references: [meeting.id]
	}),
	transcriptSegments: many(transcriptSegment),
}));

export const meetingRelations = relations(meeting, ({one, many}) => ({
	meetingParticipants: many(meetingParticipant),
	workspace: one(workspace, {
		fields: [meeting.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [meeting.userId],
		references: [user.id]
	}),
	processingEvents: many(processingEvent),
	meetingTranscriptRaws: many(meetingTranscriptRaw),
	meetingChunks: many(meetingChunk),
	tasks: many(task),
	transcriptSegments: many(transcriptSegment),
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

export const workspaceRelations = relations(workspace, ({many}) => ({
	calendarEvents: many(calendarEvent),
	meetings: many(meeting),
	invitations: many(invitation),
	workspaceMembers: many(workspaceMember),
	tasks: many(task),
}));

export const userRelations = relations(user, ({many}) => ({
	calendarEvents: many(calendarEvent),
	recallCalendarConnections: many(recallCalendarConnection),
	meetings: many(meeting),
	invitations: many(invitation),
	accounts: many(account),
	sessions: many(session),
	workspaceMembers: many(workspaceMember),
	tasks: many(task),
}));

export const recallCalendarConnectionRelations = relations(recallCalendarConnection, ({one}) => ({
	user: one(user, {
		fields: [recallCalendarConnection.userId],
		references: [user.id]
	}),
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

export const processingEventRelations = relations(processingEvent, ({one}) => ({
	meeting: one(meeting, {
		fields: [processingEvent.meetingId],
		references: [meeting.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
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

export const transcriptWordRelations = relations(transcriptWord, ({one}) => ({
	transcriptSegment: one(transcriptSegment, {
		fields: [transcriptWord.segmentId],
		references: [transcriptSegment.id]
	}),
}));

export const transcriptSegmentRelations = relations(transcriptSegment, ({one, many}) => ({
	transcriptWords: many(transcriptWord),
	meeting: one(meeting, {
		fields: [transcriptSegment.meetingId],
		references: [meeting.id]
	}),
	meetingParticipant: one(meetingParticipant, {
		fields: [transcriptSegment.participantId],
		references: [meetingParticipant.id]
	}),
}));

export const meetingTranscriptRawRelations = relations(meetingTranscriptRaw, ({one}) => ({
	meeting: one(meeting, {
		fields: [meetingTranscriptRaw.meetingId],
		references: [meeting.id]
	}),
}));

export const meetingChunkRelations = relations(meetingChunk, ({one}) => ({
	meeting: one(meeting, {
		fields: [meetingChunk.meetingId],
		references: [meeting.id]
	}),
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