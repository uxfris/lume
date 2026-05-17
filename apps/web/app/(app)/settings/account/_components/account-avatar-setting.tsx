"use client"

import { Pen } from "@solar-icons/react"
import { SettingSection } from "../../_components/setting-section"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { useRef } from "react"
import { Spinner } from "@workspace/ui/components/spinner"
import { getInitial } from "@/lib/get-initial"
import { resolveUserImageSrc } from "@/lib/user-avatar"
import { useUpdateAccountAvatarMutation } from "../_hooks/use-update-account-avatar-mutation"

export function AccountAvatarSetting() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: session } = authClient.useSession()
  const updateAvatar = useUpdateAccountAvatarMutation()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (!file) return

    try {
      await updateAvatar.update(file)
      toast.success("Updated avatar", {
        description: "Successfully uploaded new avatar",
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update avatar"
      toast.error("Failed to update avatar", { description: message })
    }
  }

  const loading = updateAvatar.isPending
  const name = session?.user.name
  const image =
    session?.user.id != null
      ? resolveUserImageSrc(session.user.id, session.user.image)
      : undefined

  return (
    <SettingSection
      title="Avatar"
      description="Set your profile avatar."
      className="flex-row"
    >
      <div className="relative h-10 w-10 overflow-hidden rounded-sm">
        <Avatar className="flex h-full w-full items-center justify-center bg-primary">
          {image ? (
            <AvatarImage src={image} alt={name ?? "Profile avatar"} />
          ) : null}
          <AvatarFallback className="rounded-sm bg-primary text-sm font-medium text-primary-foreground">
            {getInitial(name)}
          </AvatarFallback>
        </Avatar>
        {loading && (
          <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/80">
            <Spinner className="size-5 text-background" />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={loading}
        />
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/80 opacity-0 hover:opacity-100 disabled:cursor-not-allowed"
              >
                <Pen className="text-primary-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Upload a new profile avatar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </SettingSection>
  )
}
