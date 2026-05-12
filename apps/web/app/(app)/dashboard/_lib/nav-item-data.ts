import {
  ChecklistMinimalistic,
  Home,
  LayersMinimalistic,
  MinimalisticMagnifier,
  Star,
  User,
  UsersGroupRounded,
  Widget,
} from "@solar-icons/react"
import { NavItem } from "../_types/nav-item.js"
import { routes } from "@/lib/routes.js"

const navMain: NavItem[] = [
  {
    label: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    label: "Search",
    url: "#",
    icon: MinimalisticMagnifier,
    isSearch: true,
  },
  {
    label: "Tasks",
    url: routes.dashboard.tasks,
    icon: ChecklistMinimalistic,
  },
]

const navMeetings: NavItem[] = [
  {
    label: "Meetings",
    url: routes.dashboard.meetings.root,
    icon: Widget,
    isMeetings: true,
  },
  {
    label: "Starred",
    url: routes.dashboard.meetings.starred,
    icon: Star,
  },
  {
    label: "Created by me",
    url: routes.dashboard.meetings.createdByMe,
    icon: User,
  },
  {
    label: "Shared with me",
    url: routes.dashboard.meetings.sharedWithMe,
    icon: UsersGroupRounded,
  },
]

const navUploads: NavItem[] = [
  {
    label: "Uploads",
    url: routes.dashboard.uploads,

    icon: ChecklistMinimalistic,
  },
]

const navIntegrations: NavItem[] = [
  {
    label: "Integrations",
    url: routes.dashboard.integrations.root,

    icon: LayersMinimalistic,
  },
]

export { navMain, navMeetings, navUploads, navIntegrations }
