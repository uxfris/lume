import { Card, CardContent } from "@workspace/ui/components/card"
import { AccountAvatarSetting } from "./_components/account-avatar-setting"
import { AccountNameSetting } from "./_components/account-name-setting"
import { DeleteAccount } from "./_components/delete-account"
import { AccountEmailSetting } from "./_components/account-email-setting"
import { PushNotificationSetting } from "./_components/push-notification-setting"
import { TwoFactorAuthSetting } from "./_components/two-factor-auth-setting"
import { SettingHeader } from "../_components/setting-header"

export default function Account() {
  return (
    <div className="flex flex-col gap-4 px-4 py-20 md:gap-8 md:p-12">
      <SettingHeader
        title="Account settings"
        description="Personalize how other see and interact with you on Lume."
      />
      <Card className="py-2">
        <CardContent className="px-5">
          <AccountAvatarSetting />
          <AccountNameSetting />
          <AccountEmailSetting />
        </CardContent>
      </Card>
      <PushNotificationSetting />
      {/* <TwoFactorAuthSetting /> */}
      <DeleteAccount />
    </div>
  )
}
