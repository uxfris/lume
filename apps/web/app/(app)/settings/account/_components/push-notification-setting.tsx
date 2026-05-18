"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import { SettingSection } from "../../_components/setting-section"
import { Switch } from "@workspace/ui/components/switch"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "sonner"
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "../_hooks/use-notification-preferences"
import type { NotificationPreferences } from "@workspace/types"

type PreferenceKey = keyof NotificationPreferences

const PREFERENCE_ROWS: {
  key: Exclude<PreferenceKey, "pushEnabled">
  title: string
  description: string
}[] = [
  {
    key: "meetingSummaries",
    title: "Meeting Summaries",
    description: "Enable Automated AI notes after every session.",
  },
  {
    key: "insightReports",
    title: "Insight Reports",
    description: "Weekly creative analytics and project progress.",
  },
  {
    key: "collaborationAlerts",
    title: "Collaboration Alerts",
    description: "When someone mentions you or invites you.",
  },
]

export function PushNotificationSetting() {
  const { data: preferences, isLoading } = useNotificationPreferencesQuery()
  const updatePreferences = useUpdateNotificationPreferencesMutation()

  const handleToggle = async (key: PreferenceKey, checked: boolean) => {
    if (!preferences) return

    try {
      if (key === "pushEnabled" && checked && typeof window !== "undefined") {
        if ("Notification" in window && Notification.permission === "default") {
          await Notification.requestPermission()
        }
      }

      await updatePreferences.mutateAsync({ [key]: checked })
    } catch {
      toast.error("Failed to update notification settings")
    }
  }

  if (isLoading || !preferences) {
    return (
      <Card className="py-2">
        <CardContent className="flex items-center justify-center px-5 py-12">
          <Spinner className="size-6" />
        </CardContent>
      </Card>
    )
  }

  const categoryDisabled =
    !preferences.pushEnabled || updatePreferences.isPending

  return (
    <Card className="py-2">
      <CardContent className="px-5">
        <SettingSection
          title="Push Notifications"
          description="Enable push notifications to stay in the loop."
          borderBottom={false}
          className="items-start"
        >
          <SettingSection
            title="Enable notifications"
            description="Receive in-app alerts for activity across Lume."
            borderBottom
            childrenWidth="w-9"
            className="flex-row items-start"
            isChild
          >
            <Switch
              checked={preferences.pushEnabled}
              disabled={updatePreferences.isPending}
              onCheckedChange={(checked) =>
                handleToggle("pushEnabled", checked)
              }
            />
          </SettingSection>
          {PREFERENCE_ROWS.map((row, index) => (
            <SettingSection
              key={row.key}
              title={row.title}
              description={row.description}
              borderBottom={index !== PREFERENCE_ROWS.length - 1}
              childrenWidth="w-9"
              className="flex-row items-start"
              isChild
            >
              <Switch
                checked={preferences[row.key]}
                disabled={categoryDisabled}
                onCheckedChange={(checked) => handleToggle(row.key, checked)}
              />
            </SettingSection>
          ))}
        </SettingSection>
      </CardContent>
    </Card>
  )
}
