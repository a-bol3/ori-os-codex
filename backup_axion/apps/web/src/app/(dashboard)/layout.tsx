'use client'

import { OriSidebar } from '@/components/ori-sidebar'
import { GlobalSearch } from '@/components/global-search'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { sidebarCollapsed } = useAppStore()

    return (
        <div className="min-h-screen bg-background text-foreground">
            <OriSidebar />
            <main
                className={cn(
                    'transition-all duration-300 min-h-screen',
                    sidebarCollapsed ? 'ml-16' : 'ml-64'
                )}
            >
                {children}
            </main>
            <GlobalSearch />
        </div>
    )
}
