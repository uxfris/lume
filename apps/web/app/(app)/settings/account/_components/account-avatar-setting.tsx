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
import { Avatar, AvatarImage } from "@workspace/ui/components/avatar"
import { useRef, useState } from "react"
import { Spinner } from "@workspace/ui/components/spinner"
import { getInitial } from "@/lib/get-initial"

export function AccountAvatarSetting() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: session } = authClient.useSession()

  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    updateAvatar(file)
  }

  const updateAvatar = (file: File) => {
    try {
      setLoading(true)
      //   await accountApi.updateAccount({ image: file })
      toast.success("Updated avatar", {
        description: "Succesfully uploaded new avatar",
      })
    } catch (error) {
      toast.error("Failed to updated avatar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingSection
      title="Avatar"
      description="Set your profile avatar."
      className="flex-row"
    >
      <div className="relative h-10 w-10 overflow-hidden rounded-sm">
        {session?.user.image ? (
          <Avatar className="flex h-full w-full items-center justify-center bg-primary">
            <AvatarImage src={session.user.image} />
          </Avatar>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary">
            <span className="text-sm font-medium text-primary-foreground">
              {getInitial(session?.user.image)}
            </span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/80">
            <Spinner className="size-5 text-background" />
          </div>
        )}
        <>
          <input
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <TooltipProvider delayDuration={600}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-foreground/80 opacity-0 hover:opacity-100"
                >
                  <Pen className="text-primary-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Upload a new profile avatar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      </div>
    </SettingSection>
  )
}
