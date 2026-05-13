import { UpcomingMeetingItem } from "./upcoming-meeting-item"
import { UpcomingMeetingsEmpty } from "./upcoming-meetings-empty"
import { ScheduleNewMeetingButton } from "./schedule-new-meeting-button"
import { UpcomingMeetingGroup } from "@workspace/types"

export async function UpcomingMeetings({
  groups,
}: {
  groups: UpcomingMeetingGroup[]
}) {
  const total = groups.reduce((acc, g) => acc + g.meetings.length, 0)
  return (
    <div className="flex w-full flex-col gap-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{total} Upcoming Meetings</h2>
          {/* <UpcomingMeetingSettingDialog /> */}
        </div>
        <ScheduleNewMeetingButton />
      </div>
      {/* Groups */}
      {groups.length === 0 ? (
        <UpcomingMeetingsEmpty />
      ) : (
        <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label} className="space-y-4">
              <h3 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                {group.label}
              </h3>
              {group.meetings.map((meeting) => (
                <UpcomingMeetingItem
                  key={meeting.id}
                  meeting={meeting}
                  isTomorrow={group.label.toLowerCase() === "tomorrow"}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
