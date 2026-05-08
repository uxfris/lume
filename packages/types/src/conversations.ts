import { z } from "zod";

export const SentenceSchema = z.object({
    id: z.string(),
    text: z.string(),

    startTimeMs: z.number(),
    endTimeMs: z.number(),
    words: z
        .array(
            z.object({
                id: z.string(),
                text: z.string(),
                startTimeMs: z.number(),
                endTimeMs: z.number(),
                position: z.number(),
            })
        )
        .optional(),
});

export const ConversationMessageSchema = z.object({
    id: z.string(),
    timestamp: z.string().regex(/^\d{2}:\d{2}$/),

    speaker: z.string(),

    sentences: z.array(SentenceSchema),

});

export const ConversationSchema = z.object({
    id: z.string(),
    messages: z.array(ConversationMessageSchema),
});

export type Sentence = z.infer<typeof SentenceSchema>;
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;