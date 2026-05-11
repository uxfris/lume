import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { TaskList } from "./_components/task-list"
import { TaskAIInsight } from "./_components/task-ai-insight"
import { TaskProductivityStats } from "./_components/task-productivity"
import { EmptyState } from "@/components/empty-state"
import { taskApi } from "@workspace/api-client"
import { getServerApiFetchOptions } from "@/lib/server-api"
import { AssigneesProvider } from "./_hooks/use-task-assigness"

export default async function Tasks() {
  const fetchOpts = await getServerApiFetchOptions()
  const [groups, assignees] = await Promise.all([
    taskApi.fetchTasksGroup(fetchOpts),
    taskApi.fetchAssignees(fetchOpts),
  ])
  return (
    <div className="flex flex-col gap-4 overflow-hidden pt-4 md:gap-8 md:pt-10">
      <h1 className="px-4 text-base font-semibold md:px-10">Tasks</h1>
      <Tabs defaultValue="all" className="h-full gap-0">
        <div className="relative no-scrollbar h-9 overflow-x-auto overflow-y-visible px-4 md:overflow-visible md:px-10">
          <div className="absolute right-0 bottom-0 left-0 h-px w-full bg-border" />
          <TabsList
            variant="line"
            className="relative w-max justify-start gap-6"
          >
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="assign-to-me">Assigned to Me</TabsTrigger>
            <TabsTrigger value="from-last-meeting">
              From Last Meeting
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="all"
          className="flex flex-col overflow-hidden lg:flex-row"
        >
          <div className="min-w-0 flex-1 space-y-10 overflow-y-auto px-4 pt-7 pb-36 md:no-scrollbar md:px-10">
            {groups.length === 0 && (
              <EmptyState
                title="No task yet"
                description="Lume is waiting for your first meeting to begin automatically capturing action items and strategic takeaways."
                className="h-full"
              />
            )}

            <AssigneesProvider assignees={assignees}>
              {groups.map((taskGroup) => (
                <TaskList key={taskGroup.id} tasksGroup={taskGroup} />
              ))}
            </AssigneesProvider>
          </div>
          <div className="hidden w-[288px] shrink-0 space-y-8 overflow-y-auto pt-7 pr-10 pb-36 md:no-scrollbar lg:block">
            <TaskAIInsight />
            <TaskProductivityStats />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
