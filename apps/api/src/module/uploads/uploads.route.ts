import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import * as uploadsService from "./uploads.service"
import { quotaExceededResponseSchema } from "../billing/billing.schema"
import {
  completeUploadParamsSchema,
  completeUploadResponseSchema,
  fetchFromLinkBodySchema,
  fetchFromLinkResponseSchema,
  listUploadsQuerySchema,
  listUploadsResponseSchema,
  presignUploadBodySchema,
  presignUploadResponseSchema,
  uploadErrorSchema,
} from "./uploads.schema"

export const uploadsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/presign",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspace,
        app.requireQuota,
      ],
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
          keyGenerator: (request) => request.user?.id ?? request.ip,
        },
      },
      schema: {
        tags: ["Uploads"],
        summary: "Create a PENDING meeting + presigned S3 URL for its audio",
        body: presignUploadBodySchema,
        response: {
          201: presignUploadResponseSchema,
          400: uploadErrorSchema,
          402: quotaExceededResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await uploadsService.presignUpload({
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        fileName: request.body.fileName,
        fileType: request.body.fileType,
        fileSize: request.body.fileSize,
        title: request.body.title,
      })

      return reply.status(201).send(result)
    }
  )

  app.post(
    "/from-url",
    {
      preHandler: [
        app.verifySession,
        app.requireWorkspace,
        app.requireQuota,
      ],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
          keyGenerator: (request) => request.user?.id ?? request.ip,
        },
      },
      schema: {
        tags: ["Uploads"],
        summary:
          "Fetch a remote audio/video/PDF URL server-side, store in S3, and queue transcription",
        body: fetchFromLinkBodySchema,
        response: {
          200: fetchFromLinkResponseSchema,
          400: uploadErrorSchema,
          402: quotaExceededResponseSchema,
          422: uploadErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await uploadsService.importFromUrl({
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        url: request.body.url,
        title: request.body.title,
        traceId: request.id,
      })

      if (!result.ok) {
        const status =
          result.error === "FILE_TOO_LARGE" ||
          result.error === "UNSUPPORTED_TYPE"
            ? 422
            : result.error === "BLOCKED_HOST" || result.error === "INVALID_URL"
              ? 400
              : 422

        return reply.status(status).send({
          error: result.error,
          ...(result.message ? { message: result.message } : {}),
        })
      }

      return reply.status(200).send({
        meetingId: result.meetingId,
        status: result.status,
      })
    }
  )

  app.post(
    "/:id/complete",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Uploads"],
        summary:
          "Finalize the upload, flip meeting to UPLOADED, enqueue transcribe",
        params: completeUploadParamsSchema,
        response: {
          200: completeUploadResponseSchema,
          403: uploadErrorSchema,
          404: uploadErrorSchema,
          409: uploadErrorSchema,
          422: uploadErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await uploadsService.completeUpload({
        meetingId: request.params.id,
        workspaceId: request.workspace!.id,
        userId: request.user!.id,
        traceId: request.id,
      })

      if (!result.ok) {
        const status =
          result.error === "MEETING_NOT_FOUND"
            ? 404
            : result.error === "MEETING_FORBIDDEN"
              ? 403
              : result.error === "MEETING_NOT_PENDING"
                ? 409
                : 422

        return reply.status(status).send({
          error: result.error,
          ...(result.message ? { message: result.message } : {}),
        })
      }

      return reply.status(200).send({
        meetingId: result.meetingId,
        status: result.status,
      })
    }
  )

  app.get(
    "/",
    {
      preHandler: [app.verifySession, app.requireWorkspace],
      schema: {
        tags: ["Uploads"],
        summary: "List recent UPLOAD-sourced meetings in the current workspace",
        querystring: listUploadsQuerySchema,
        response: {
          200: listUploadsResponseSchema,
        },
      },
    },
    async (request) => {
      const meetings = await uploadsService.listRecentUploads(
        request.workspace!.id,
        request.query.limit
      )

      return {
        uploads: meetings.map((m) => ({
          meetingId: m.id,
          title: m.title,
          fileName: m.fileName,
          fileType: m.fileType,
          fileSize: m.fileSize,
          status: m.status,
          createdAt: m.createdAt.toISOString(),
        })),
      }
    }
  )
}
