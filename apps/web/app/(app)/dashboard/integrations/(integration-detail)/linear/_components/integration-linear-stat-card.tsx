export function IntegrationLinearStatCard({
    issuesCreated,
    autoAssigned,
    meetingsConnected,
}: {
    issuesCreated: number
    autoAssigned: number
    meetingsConnected: number
}) {
    const stats = [
        { id: "issue", number: String(issuesCreated), label: "Issues created" },
        { id: "assign", number: String(autoAssigned), label: "Auto-assigned" },
        { id: "meetings", number: String(meetingsConnected), label: "Meetings connected" },
    ]

    return (
        <div className="flex items-center gap-2">
            {stats.map((stat) => (
                <div key={stat.id} className="px-5 py-2 bg-secondary rounded-lg flex-1">
                    <h2 className="text-lg font-semibold">{stat.number}</h2>
                    <p className="text-xs">{stat.label}</p>
                </div>
            ))}
        </div>
    )
}
