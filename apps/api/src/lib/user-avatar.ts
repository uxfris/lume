import { GetObjectCommand } from "@aws-sdk/client-s3"
import { buildUserAvatarKey } from "./s3-predesign"
import { env } from "../config/env"
import { s3 } from "./s3"

const HOSTED_AVATAR_KEY_PATTERN = /^users\/[^/]+\/avatar$/
const HOSTED_AVATAR_URL_PATTERN = /\/users\/[^/]+\/avatar\/?$/

/** Browser-facing path proxied by Next.js to the API. */
export function buildUserAvatarApiPath(userId: string): string {
  return `/api/users/${userId}/avatar`
}

export function isHostedAvatar(image: string | null | undefined): boolean {
  if (!image) return false
  if (image.startsWith("/api/users/") && image.endsWith("/avatar")) return true
  if (HOSTED_AVATAR_KEY_PATTERN.test(image)) return true
  if (image.startsWith("http") && HOSTED_AVATAR_URL_PATTERN.test(image)) return true
  return false
}

/**
 * Maps stored user.image values to a same-origin URL the browser can load.
 * OAuth profile images are returned unchanged.
 */
export function resolveUserImageUrl(
  userId: string,
  image: string | null | undefined
): string | null {
  if (!image) return null
  if (isHostedAvatar(image)) return buildUserAvatarApiPath(userId)
  return image
}

export async function streamUserAvatar(userId: string) {
  const key = buildUserAvatarKey(userId)
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
