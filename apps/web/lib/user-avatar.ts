/**
 * Resolves user.image for <img> / AvatarImage src.
 * Hosted avatars in private S3 are loaded via the authenticated API proxy.
 */
export function resolveUserImageSrc(
  userId: string,
  image?: string | null
): string | undefined {
  if (!image) return undefined
  if (image.startsWith("/api/users/")) return image
  if (image.includes("/users/") && image.includes("/avatar")) {
    return `/api/users/${userId}/avatar`
  }
  return image
}
