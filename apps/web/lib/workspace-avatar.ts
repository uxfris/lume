/**
 * Resolves workspace.image for <img> / AvatarImage src.
 * Hosted avatars in private S3 are loaded via the authenticated API proxy.
 */
export function resolveWorkspaceImageSrc(
  workspaceId: string,
  image?: string | null
): string | undefined {
  if (!image) return undefined
  if (image.startsWith("/api/workspaces/")) return image
  if (image.includes("/workspaces/") && image.includes("/avatar")) {
    return `/api/workspaces/${workspaceId}/avatar`
  }
  return image
}
