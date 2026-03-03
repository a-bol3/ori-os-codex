'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Building2,
  DollarSign,
  Mail,
  Zap,
  Activity,
  Plus,
  ArrowRight,
  Globe,
  Cpu,
  Shield,
  Server,
  Terminal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardStat } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CounterUp } from '@/components/ui/counter-up'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { useDashboard } from '@/hooks/use-dashboard'

export function DashboardView() {
  const { setCurrentView } = useAppStore()
  const { data: dashboardData, loading: dashboardLoading } = useDashboard()
  const [activeModule, setActiveModule] = useState('01')

  const stats = [
    { title: 'Total Nodes', value: 1284, unit: 'ACTV', icon: Server, color: 'text-axion-orange' },
    { title: 'Data Throughput', value: 84.2, unit: 'GB/S', icon: Activity, color: 'text-axion-green' },
    { title: 'Neural Load', value: 65, unit: 'PCT', icon: Cpu, color: 'text-axion-orange' },
    { title: 'Protocol Sec', value: 99.9, unit: 'LVL', icon: Shield, color: 'text-axion-green' },
  ]

  const chartData = [
    { time: '00:00', load: 45, throughput: 30 },
    { time: '04:00', load: 52, throughput: 45 },
    { time: '08:00', load: 68, throughput: 80 },
    { time: '12:00', load: 85, throughput: 75 },
    { time: '16:00', load: 72, throughput: 60 },
    { time: '20:00', load: 90, throughput: 85 },
    { time: '23:59', load: 65, throughput: 50 },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6 overflow-hidden">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-axion-orange font-mono text-[9px] tracking-[0.3em] uppercase mb-1">
            <Zap size={10} className="fill-current" />
            System_Core // active
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Command Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 px-6 border-x border-white/10 h-10">
            <div className="text-right">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Latency</div>
              <div className="text-xs font-mono text-axion-green font-bold">12MS</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Uptime</div>
              <div className="text-xs font-mono text-white font-bold">99.998%</div>
            </div>
          </div>
          <Button size="sm" className="bg-axion-orange text-black font-black uppercase text-[10px] tracking-widest h-10 px-6" onClick={() => setCurrentView('dashboard')}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Launch Dashboard
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column: Stats & Logs */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <CardStat key={i} className="p-4 group">
                <div className="flex justify-between items-start mb-4">
                  <stat.icon size={16} className={cn("transition-colors", i % 2 === 0 ? "text-axion-orange" : "text-axion-green")} />
                  <span className="text-[9px] font-mono text-white/40 font-bold uppercase tracking-widest">{stat.unit}</span>
                </div>
                <div className="text-2xl font-black tracking-tight mb-1">
                  <CounterUp value={stat.value} duration={2000} />
                  {stat.unit === 'PCT' && '%'}
                </div>
                <div className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest">{stat.title}</div>
              </CardStat>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={14} className="text-axion-orange" />
                Telemetry_Logs
              </div>
              <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 uppercase tracking-widest">Real-time</Badge>
            </div>
            <div className="space-y-4 font-mono text-[10px] h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {[
                { time: '14:20:01', msg: 'Neural_link established with Cluster_Alpha', type: 'success' },
                { time: '14:20:45', msg: 'Data packet shard 834-X validated', type: 'info' },
                { time: '14:21:12', msg: 'Resource scaling initiated: +12 nodes', type: 'warn' },
                { time: '14:22:05', msg: 'Security firewall sweep complete: 0 threats', type: 'success' },
                { time: '14:23:30', msg: 'Heartbeat signal detected from Node_92', type: 'info' },
                { time: '14:24:15', msg: 'Latency threshold reached in EU-WEST-2', type: 'info' },
                { time: '14:25:50', msg: 'Auth token refreshed for User_832', type: 'success' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 group/log">
                  <span className="text-white/20 whitespace-nowrap">[{log.time}]</span>
                  <span className={cn(
                    "flex-1 group-hover/log:translate-x-1 transition-transform",
                    log.type === 'success' ? 'text-axion-green' : log.type === 'warn' ? 'text-axion-orange' : 'text-white/60'
                  )}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right: Visualizer & Charts */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white/5 border border-white/10 p-8 h-[450px] relative overflow-hidden group">
            {/* Visualizer Background Grid */}
            <div className="absolute inset-0 telemetry-grid opacity-30" />

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-auto">
                <div>
                  <div className="text-[9px] font-mono font-bold text-axion-orange uppercase tracking-[0.3em] mb-2">Core_Orchestrator</div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Neural Visualizer</h2>
                </div>
                <div className="flex gap-1">
                  {['01', '02', '03'].map(mod => (
                    <button
                      key={mod}
                      onClick={() => setActiveModule(mod)}
                      className={cn(
                        "w-12 h-8 flex items-center justify-center text-[10px] font-mono font-bold transition-all border",
                        activeModule === mod ? "bg-axion-orange border-axion-orange text-black" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                      )}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Visualizer Placeholder - Glowing Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 flex items-center justify-center">
                <div className="absolute w-full h-full border border-axion-orange/20 rounded-full animate-spin-slow" />
                <div className="absolute w-4/5 h-4/5 border border-white/10 rounded-full animate-reverse-spin" />
                <div className="w-32 h-32 bg-axion-orange/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-16 h-16 border-2 border-axion-orange flex items-center justify-center bg-black">
                  <Zap className="text-axion-orange fill-current animate-pulse" />
                </div>

                {/* Floating Orbitals */}
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-axion-orange"
                    animate={{
                      rotate: 360,
                      x: [120 * Math.cos(i * (Math.PI / 2)), 120 * Math.cos((i * (Math.PI / 2)) + 2)],
                      y: [120 * Math.sin(i * (Math.PI / 2)), 120 * Math.sin((i * (Math.PI / 2)) + 2)],
                    }}
                    transition={{ repeat: Infinity, duration: 10 + i, ease: "linear" }}
                  />
                ))}
              </div>

              <div className="mt-auto flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="text-[10px] font-mono">
                    <span className="text-white/30 uppercase tracking-widest block mb-1">X_AXIS</span>
                    <span className="text-white font-bold tracking-widest">128.42.01</span>
                  </div>
                  <div className="text-[10px] font-mono">
                    <span className="text-white/30 uppercase tracking-widest block mb-1">Y_AXIS</span>
                    <span className="text-white font-bold tracking-widest">844.02.XC</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">Node Status</div>
                  <div className="flex gap-1 justify-end">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className={cn("w-2 h-4 border border-white/10", i < 6 ? "bg-axion-green/50 border-axion-green/50" : "bg-white/5")} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 p-6">
              <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center justify-between">
                Resource Load
                <span className="text-axion-orange">65%</span>
              </div>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF5C00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white" opacity={0.05} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#050505',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <Area type="monotone" dataKey="load" stroke="#FF5C00" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6">
              <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center justify-between">
                Signal Propagation
                <span className="text-axion-green">Stable</span>
              </div>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FF41" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00FF41" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="white" opacity={0.05} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#050505',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <Area type="monotone" dataKey="throughput" stroke="#00FF41" fillOpacity={1} fill="url(#colorThroughput)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
