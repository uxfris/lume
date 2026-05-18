import { GetObjectCommand } from "@aws-sdk/client-s3"
import { buildWorkspaceAvatarKey } from "./s3-predesign"
import { env } from "../config/env"
import { s3 } from "./s3"

const HOSTED_AVATAR_KEY_PATTERN = /^workspaces\/[^/]+\/avatar$/
const HOSTED_AVATAR_URL_PATTERN = /\/workspaces\/[^/]+\/avatar\/?$/

/** Browser-facing path proxied by Next.js to the API. */
export function buildWorkspaceAvatarApiPath(workspaceId: string): string {
  return `/api/workspaces/${workspaceId}/avatar`
}

export function isHostedWorkspaceAvatar(
  image: string | null | undefined
): boolean {
  if (!image) return false
  if (image.startsWith("/api/workspaces/") && image.endsWith("/avatar")) {
    return true
  }
  if (HOSTED_AVATAR_KEY_PATTERN.test(image)) return true
  if (image.startsWith("http") && HOSTED_AVATAR_URL_PATTERN.test(image)) {
    return true
  }
  return false
}

export function resolveWorkspaceImageUrl(
  workspaceId: string,
  image: string | null | undefined
): string | null {
  if (!image) return null
  if (isHostedWorkspaceAvatar(image)) {
    return buildWorkspaceAvatarApiPath(workspaceId)
  }
  return image
}

export async function streamWorkspaceAvatar(workspaceId: string) {
  const key = buildWorkspaceAvatarKey(workspaceId)
  const result = await s3.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    })
  )

  if (!result.Body) {
    return null
  }

  return {
    body: result.Body,
    contentType: result.ContentType ?? "application/octet-stream",
    etag: result.ETag,
  }
}
