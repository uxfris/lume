export default function MeetingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen min-h-0">
            <main className="w-xl min-h-0 flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
