"use client"

import { Soundwave, Stars } from "@solar-icons/react/ssr"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { meetingTimeLabel } from "../_lib/meeting-time-label"
import { useTaskAIInsightQuery } from "../_hooks/queries/use-task-ai-insight-query"

function formatUrgentContext(label: string, mentionCount?: number) {
  if (!mentionCount || mentionCount <= 1) return label
  return `${label} (${mentionCount} mentions)`
}

export function TaskAIInsight() {
  const { data, isLoading, isError } = useTaskAIInsightQuery()
  const insight = data?.insight ?? null
  const isEmpty = !isLoading && !isError && !insight

  return (
    <Card className="border border-accent-3/50 bg-accent-3/30 px-5 py-8">
      <CardHeader className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Stars className="h-5 w-5 text-primary-foreground" />
        </div>
        <h3 className="text-base font-semibold text-primary">AI Insight</h3>
      </CardHeader>
      {isLoading ? (
        <CardContent>
          <p className="text-center text-sm text-primary/60">
            Analyzing your latest meeting insights...
          </p>
        </CardContent>
      ) : isError ? (
        <CardContent>
          <p className="text-center text-sm text-destructive">
            Could not load AI insights.
          </p>
        </CardContent>
      ) : isEmpty || !insight ? (
        <CardContent className="flex flex-col items-center gap-4">
          <Soundwave className="h-8 w-8 text-primary/20" />
          <p className="text-center text-primary/80">
            Lume is listening. Start your first meeting to surface unique team
            insights here.
          </p>
        </CardContent>
      ) : (
        <CardContent>
          <p className="text-primary/80">
            Based on {meetingTimeLabel(insight.meetingUpdatedAt)}{" "}
            <b>{insight.meetingTitle}</b> meeting, there&apos;s a{" "}
            {insight.confidence}% confidence that{" "}
            <b>{insight.recommendedTaskTitle}</b> should be prioritized
            {insight.alternateTaskTitle ? (
              <>
                {" "}
                ahead of <b>{insight.alternateTaskTitle}</b>
              </>
            ) : null}
            .
          </p>
          {insight.urgentContexts.length > 0 ? (
            <>
              <Separator className="my-6 bg-primary/5" />
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase text-primary/75">
                  Urgent Contexts
                </h4>
                <ul className="space-y-3">
                  {insight.urgentContexts.map((context) => (
                    <li
                      key={context.label}
                      className="font-medium text-primary"
                    >
                      {formatUrgentContext(context.label, context.mentionCount)}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </CardContent>
      )}
    </Card>
  )
}
