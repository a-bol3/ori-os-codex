'use client'

import { Users, Building2, DollarSign, Mail, Zap, Activity } from 'lucide-react'
import { CardStat } from '@/components/ui/card'
import { CounterUp } from '@/components/ui/counter-up'
import { DashboardData } from '@/hooks/use-dashboard'

interface DashboardStatsProps {
    data: DashboardData | null
    loading: boolean
}

export function DashboardStats({ data, loading }: DashboardStatsProps) {
    const stats = [
        {
            title: 'Total Contacts',
            value: data?.contacts.total || 0,
            unit: 'CRM',
            icon: Users,
            color: 'text-blue-500',
            description: `+${data?.contacts.growth || 0}% from last month`
        },
        {
            title: 'Active Campaigns',
            value: data?.campaigns.active || 0,
            unit: 'ENG',
            icon: Mail,
            color: 'text-axion-orange',
            description: `${data?.campaigns.sent || 0} emails sent`
        },
        {
            title: 'Pipeline Value',
            value: data?.deals.value || 0,
            unit: 'DEAL',
            icon: DollarSign,
            color: 'text-axion-green',
            description: `${data?.deals.total || 0} open deals`
        },
        {
            title: 'Automation Runs',
            value: data?.workflows.runs || 0,
            unit: 'AUTO',
            icon: Zap,
            color: 'text-purple-500',
            description: `${data?.workflows.active || 0} active flows`
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <CardStat key={i} className="p-4 group">
                    <div className="flex justify-between items-start mb-4">
                        <stat.icon size={16} className={stat.color} />
                        <span className="text-[9px] font-mono text-white/40 font-bold uppercase tracking-widest">{stat.unit}</span>
                    </div>
                    <div className="text-2xl font-black tracking-tight mb-1">
                        {loading ? (
                            <div className="h-8 w-24 bg-white/10 animate-pulse rounded" />
                        ) : (
                            <>
                                {stat.title === 'Pipeline Value' && '$'}
                                <CounterUp value={stat.value} duration={2000} />
                            </>
                        )}
                    </div>
                    <div className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest">{stat.title}</div>
                    <div className="text-[10px] text-white/40 mt-2">{stat.description}</div>
                </CardStat>
            ))}
        </div>
    )
}
