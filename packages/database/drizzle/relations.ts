import { relations } from "drizzle-orm/relations";
import { workspace, channel, user, account, workspaceMember, invitation, meeting, meetingShare, userNotificationPreference, notification, session, processingEvent, task, meetingChunk, transcriptSegment, meetingParticipant, recallCalendarConnection, transcriptWord, meetingTranscriptRaw, calendarEvent, usageCounter } from "./schema";

export const channelRelations = relations(channel, ({one, many}) => ({
	workspace: one(workspace, {
		fields: [channel.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [channel.creatorId],
		references: [user.id]
	}),
	meetings: many(meeting),
}));

export const workspaceRelations = relations(workspace, ({many}) => ({
	channels: many(channel),
	workspaceMembers: many(workspaceMember),
	invitations: many(invitation),
	tasks: many(task),
	meetings: many(meeting),
	calendarEvents: many(calendarEvent),
	usageCounters: many(usageCounter),
}));

export const userRelations = relations(user, ({many}) => ({
	channels: many(channel),
	accounts: many(account),
	workspaceMembers: many(workspaceMember),
	invitations: many(invitation),
	meetingShares_userId: many(meetingShare, {
		relationName: "meetingShare_userId_user_id"
	}),
	meetingShares_invitedByUserId: many(meetingShare, {
		relationName: "meetingShare_invitedByUserId_user_id"
	}),
	userNotificationPreferences: many(userNotificationPreference),
	notifications: many(notification),
	sessions: many(session),
	tasks: many(task),
	meetings: many(meeting),
	recallCalendarConnections: many(recallCalendarConnection),
	calendarEvents: many(calendarEvent),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
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

export const meetingShareRelations = relations(meetingShare, ({one}) => ({
	meeting: one(meeting, {
		fields: [meetingShare.meetingId],
		references: [meeting.id]
	}),
	user_userId: one(user, {
		fields: [meetingShare.userId],
		references: [user.id],
		relationName: "meetingShare_userId_user_id"
	}),
	user_invitedByUserId: one(user, {
		fields: [meetingShare.invitedByUserId],
		references: [user.id],
		relationName: "meetingShare_invitedByUserId_user_id"
	}),
}));

export const meetingRelations = relations(meeting, ({one, many}) => ({
	meetingShares: many(meetingShare),
	processingEvents: many(processingEvent),
	tasks: many(task),
	channel: one(channel, {
		fields: [meeting.channelId],
		references: [channel.id]
	}),
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

export const userNotificationPreferenceRelations = relations(userNotificationPreference, ({one}) => ({
	user: one(user, {
		fields: [userNotificationPreference.userId],
		references: [user.id]
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.userId],
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