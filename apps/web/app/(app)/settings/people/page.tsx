import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { SettingHeader } from "../_components/setting-header"
import { PeopleDataTable } from "./_components/people-data-table"
import { peopleColumns } from "./_components/columns/people-column"

import {
  WorkspacePeopleInvitationTable,
  WorkspacePeopleTable,
} from "@workspace/types"
import { peopleInvitationColumns } from "./_components/columns/people-invitation-column"
import { InvitationEmpty } from "./_components/people-invitation-empty"

export const workspacePeopleMock: WorkspacePeopleTable = [
  {
    id: "usr_001",
    name: "Fris El",
    email: "uxfris@gmail.com",
    avatarInitials: "F",
    avatarUrl: "",
    role: "owner",
    joinedAt: "2026-03-24T00:00:00.000Z",
    isCurrentUser: true,
  },
  {
    id: "usr_002",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatarInitials: "SC",
    avatarUrl: "",
    role: "admin",
    joinedAt: "2026-03-28T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_003",
    name: "Alex Morgan",
    email: "alex@example.com",
    avatarInitials: "AM",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-01T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_004",
    name: "Daniel Kim",
    email: "daniel.kim@example.com",
    avatarInitials: "DK",
    avatarUrl: "",
    role: "member",

    joinedAt: "2026-04-02T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_005",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    avatarInitials: "MG",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-03T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_006",
    name: "James Wilson",
    email: "james.wilson@example.com",
    avatarInitials: "JW",
    avatarUrl: "",
    role: "admin",
    joinedAt: "2026-04-03T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_007",
    name: "Aisha Khan",
    email: "aisha.khan@example.com",
    avatarInitials: "AK",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-04T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_008",
    name: "Liam Brown",
    email: "liam.brown@example.com",
    avatarInitials: "LB",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-04T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_009",
    name: "Olivia Davis",
    email: "olivia.davis@example.com",
    avatarInitials: "OD",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-05T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_010",
    name: "Noah Martinez",
    email: "noah.martinez@example.com",
    avatarInitials: "NM",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-05T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_011",
    name: "Emma Anderson",
    email: "emma.anderson@example.com",
    avatarInitials: "EA",
    avatarUrl: "",
    role: "admin",
    joinedAt: "2026-04-06T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_012",
    name: "William Thomas",
    email: "william.thomas@example.com",
    avatarInitials: "WT",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-06T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_013",
    name: "Sophia Taylor",
    email: "sophia.taylor@example.com",
    avatarInitials: "ST",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-07T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_014",
    name: "Benjamin Lee",
    email: "benjamin.lee@example.com",
    avatarInitials: "BL",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-07T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_015",
    name: "Isabella Clark",
    email: "isabella.clark@example.com",
    avatarInitials: "IC",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-08T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_016",
    name: "Ethan Lewis",
    email: "ethan.lewis@example.com",
    avatarInitials: "EL",
    avatarUrl: "",
    role: "admin",
    joinedAt: "2026-04-08T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_017",
    name: "Mia Walker",
    email: "mia.walker@example.com",
    avatarInitials: "MW",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-09T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_018",
    name: "Lucas Hall",
    email: "lucas.hall@example.com",
    avatarInitials: "LH",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-09T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_019",
    name: "Amelia Young",
    email: "amelia.young@example.com",
    avatarInitials: "AY",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-10T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_020",
    name: "Henry King",
    email: "henry.king@example.com",
    avatarInitials: "HK",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-10T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_021",
    name: "Charlotte Wright",
    email: "charlotte.wright@example.com",
    avatarInitials: "CW",
    avatarUrl: "",
    role: "admin",
    joinedAt: "2026-04-11T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_022",
    name: "Logan Scott",
    email: "logan.scott@example.com",
    avatarInitials: "LS",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-11T00:00:00.000Z",
    isCurrentUser: false,
  },
  {
    id: "usr_023",
    name: "Harper Green",
    email: "harper.green@example.com",
    avatarInitials: "HG",
    avatarUrl: "",
    role: "member",
    joinedAt: "2026-04-12T00:00:00.000Z",
    isCurrentUser: false,
  },
]

export const workspacePeopleInvitationMock: WorkspacePeopleInvitationTable = [
  {
    id: "usr_001",
    name: "Fris El",
    email: "uxfris@gmail.com",
    avatarInitials: "F",
    avatarUrl: "",
    role: "owner",
    invitedAt: "2026-03-24T00:00:00.000Z",
  },
  {
    id: "usr_002",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatarInitials: "SC",
    avatarUrl: "",
    role: "admin",
    invitedAt: "2026-03-28T00:00:00.000Z",
  },
  {
    id: "usr_003",
    name: "Alex Morgan",
    email: "alex@example.com",
    avatarInitials: "AM",
    avatarUrl: "",
    role: "member",
    invitedAt: "2026-04-01T00:00:00.000Z",
  },
]

export default function People() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-20 md:gap-8 md:p-12">
      <SettingHeader
        title="People"
        description="Inviting people to Fris's Lume gives access to workspace shared projects and credits. You have 1 builder in this workspace."
      />
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="w-fit gap-2">
          <TabsTrigger value="all" className="px-4">
            All
          </TabsTrigger>
          <TabsTrigger value="invited" className="px-4">
            Invited
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <PeopleDataTable columns={peopleColumns} data={workspacePeopleMock} />
        </TabsContent>
        <TabsContent value="invited">
          <div className="space-y-2">
            {workspacePeopleInvitationMock.length === 0 && <InvitationEmpty />}
            {workspacePeopleInvitationMock.length !== 0 && (
              <PeopleDataTable
                columns={peopleInvitationColumns}
                data={workspacePeopleInvitationMock}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
