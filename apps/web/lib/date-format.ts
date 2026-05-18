export function formatDate(dateString: string) {
    const date = new Date(dateString)

    const parts = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).formatToParts(date)

    const map: any = {}
    parts.forEach(p => map[p.type] = p.value)

    return `${map.weekday}, ${map.month} ${map.year} ${map.hour}:${map.minute} ${map.dayPeriod}`
}

export function formatEditedLabel(dateString: string) {
    return `Edited ${new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    })}`
}

export function formatDateOnly(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}



export function formatTimeAgoIntl(dateString: string) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: "auto" })

    const now = new Date()
    const date = new Date(dateString)

    const seconds = Math.floor((date.getTime() - now.getTime()) / 1000)

    const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
        { amount: 60, unit: "second" },
        { amount: 60, unit: "minute" },
        { amount: 24, unit: "hour" },
        { amount: 30, unit: "day" },
        { amount: 12, unit: "month" },
        { amount: Infinity, unit: "year" }
    ]

    let duration = seconds

    for (const division of divisions) {
        if (Math.abs(duration) < division.amount) {
            return rtf.format(Math.round(duration), division.unit)
        }
        duration /= division.amount
    }

    return rtf.format(0, "second")

}

