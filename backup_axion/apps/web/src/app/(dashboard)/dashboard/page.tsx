'use client'

import { DashboardView } from '@/components/dashboard-view'
import { DashboardStats } from '@/components/dashboard-stats'
import { useDashboard } from '@/hooks/use-dashboard'
import { Terminal, Zap, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
    const { data, loading } = useDashboard()

    return (
        <div className="min-h-screen bg-black text-white p-6 space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-axion-orange font-mono text-[9px] tracking-[0.3em] uppercase mb-1">
                        <Zap size={10} className="fill-current" />
                        ORI-OS // Command_Center
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Command Center</h1>
                </div>
            </div>

            {/* Main Stats Grid */}
            <DashboardStats data={data} loading={loading} />

            <div className="grid grid-cols-12 gap-6">
                {/* Recent Activity / Logs */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={14} className="text-axion-orange" />
                                System_Events
                            </div>
                            <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 uppercase tracking-widest">Live</Badge>
                        </div>

                        <div className="space-y-4 font-mono text-[10px] h-[400px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-4 w-full bg-white/5 animate-pulse rounded" />
                                ))
                            ) : (
                                data?.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 group/log">
                                        <span className="text-white/20 whitespace-nowrap">[{new Date(activity.time).toLocaleTimeString()}]</span>
                                        <span className={cn(
                                            "flex-1 group-hover/log:translate-x-1 transition-transform",
                                            activity.type === 'email' ? 'text-axion-orange' : activity.type === 'contact' ? 'text-axion-green' : 'text-white/60'
                                        )}>
                                            {activity.title}: {activity.description}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Dashboard Visualizer Placeholder */}
                <div className="col-span-12 lg:col-span-8">
                    <DashboardView />
                </div>
            </div>
        </div>
    )
}
