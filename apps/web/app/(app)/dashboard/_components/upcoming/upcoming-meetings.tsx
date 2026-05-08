import { UpcomingMeetingItem } from "./upcoming-meeting-item"
import { UpcomingMeetingSettingDialog } from "./upcoming-meeting-setting-dialog"
import { UpcomingMeetingsEmpty } from "./upcoming-meetings-empty"
import { ScheduleNewMeetingButton } from "./schedule-new-meeting-button"
import { meetingApi } from "@workspace/api-client"
import { getServerApiFetchOptions } from "@/lib/server-api"



export async function UpcomingMeetings() {
    const { cookie, workspaceId } = await getServerApiFetchOptions()
    const groups = await meetingApi.getUpcomingMeetings({
        cookie,
        workspaceId,
    })

    const total = groups.reduce((acc, g) => acc + g.meetings.length, 0)

    return (
        <div className="w-full flex flex-col gap-8">
            <div>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{total} Upcoming Meetings</h2>
                    <UpcomingMeetingSettingDialog />
                </div>
                <ScheduleNewMeetingButton />
            </div>
            {/* Groups */}
            {groups.length === 0 ? <UpcomingMeetingsEmpty /> :
                <div className="flex-1 no-scrollbar overflow-y-auto space-y-8">
                    {groups.map((group) => (
                        <div key={group.label} className="space-y-4">
                            <h3 className="uppercase text-[11px] font-semibold text-muted-foreground tracking-widest">{group.label}</h3>
                            {group.meetings.map((meeting) => (
                                <UpcomingMeetingItem key={meeting.id} meeting={meeting} isTomorrow={group.label.toLowerCase() === "tomorrow"} />
                            ))}
                        </div>
                    ))}
                </div>
            }

        </div>
    )
}