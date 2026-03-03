'use client'

import { motion } from 'framer-motion'
import { Zap, Activity, Shield, Cpu, Globe, Server, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardStat } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'

export function HeroSection() {
  const { setCurrentView } = useAppStore()

  const handleStart = () => {
    setCurrentView('dashboard')
  }

  return (
    <section className="relative min-h-screen flex items-stretch overflow-hidden bg-black pt-16">
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 telemetry-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-axion-orange/5 blur-[120px] rounded-full" />

      {/* Vertical Navigation Strip (Left) */}
      <div className="hidden lg:flex flex-col border-r border-white/10 w-20 items-center py-12 gap-8 sticky top-16 h-[calc(100vh-64px)]">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div key={num} className="group cursor-pointer flex flex-col items-center gap-2">
            <span className={num === 1 ? "text-axion-orange font-mono text-[10px] border border-axion-orange/50 p-1" : "text-white/20 font-mono text-[10px] hover:text-white transition-colors"}>
              {num.toString().padStart(2, '0')}
            </span>
            {num === 1 && <div className="w-px h-12 bg-axion-orange" />}
          </div>
        ))}
        <div className="mt-auto -rotate-90 whitespace-nowrap">
          <span className="text-[10px] font-mono text-white/20 tracking-[0.5em] uppercase">NAV // MODULE_V4</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 py-20 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-axion-green font-mono text-[10px] tracking-[0.2em] uppercase mb-8">
              <div className="h-2 w-2 rounded-full bg-axion-green animate-pulse" />
              ORI-OS: Online // Intelligence Active
            </div>

            <h1 className="text-7xl md:text-9xl font-black text-white leading-tight tracking-[-0.04em] mb-4 uppercase">
              Omnichannel <br /> Engagement <br />
              <span className="text-white/30">Suite</span>
            </h1>

            <div className="h-px w-24 bg-axion-orange mb-8" />

            <p className="text-white/60 text-lg md:text-xl max-w-xl mb-12 leading-relaxed font-light">
              The complete intelligence and automation platform for modern revenue teams. Engineered for precision and outbound excellence.
            </p>

            <ul className="space-y-4 mb-12">
              {[
                'Global Distributed Infrastructure',
                'Autonomous Agent Orchestration',
                'Sub-10ms Execution Latency',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-white uppercase tracking-widest">
                  <div className="h-1.5 w-1.5 bg-axion-orange" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" className="group" onClick={handleStart}>
                Initialize Build
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="xl" variant="outline">
                View Documentation
                <Cpu className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Telemetry Panel (Right) */}
        <div className="hidden xl:flex flex-col w-[400px] border-l border-white/10 p-12 justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <CardStat className="relative group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Active_Nodes</span>
                <div className="flex gap-1">
                  <div className="h-1 w-1 bg-axion-green" />
                  <div className="h-1 w-1 bg-axion-green" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-white">US-EAST-1</span>
                  <span className="text-axion-green font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-white">EU-WEST-2</span>
                  <span className="text-axion-green font-bold">ONLINE</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Globe size={12} className="text-axion-orange animate-spin-slow" />
              </div>
            </CardStat>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <CardStat className="relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">System_Health</span>
                <Server size={16} className="text-axion-orange" />
              </div>
              <div className="text-4xl font-extrabold text-white mb-6 tracking-tighter">99.99%</div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-2 uppercase tracking-widest text-white/40 font-bold">
                    <span>Load Status</span>
                    <span className="text-white">OPTIMAL</span>
                  </div>
                  <div className="h-1 bg-white/10 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-axion-orange"
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1, delay: 1 }}
                    />
                  </div>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-white/40 font-bold uppercase tracking-widest">Latency: <span className="text-white">12ms</span></span>
                  <span className="text-axion-green font-bold uppercase tracking-widest">Optimal</span>
                </div>
              </div>
            </CardStat>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
          >
            <CardStat className="border-axion-orange/20 bg-axion-orange/5">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono text-axion-orange uppercase tracking-[0.2em] font-bold">Deployments</span>
                <span className="text-[10px] font-mono text-axion-orange animate-pulse font-bold tracking-widest uppercase">Processing</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 border border-axion-orange/30 flex items-center justify-center bg-axion-orange/10">
                  <Activity size={18} className="text-axion-orange" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-widest">Build #8342-XC</div>
                  <div className="text-[9px] text-white/40 font-mono mt-1">Deploying to cluster_alpha...</div>
                </div>
              </div>
            </CardStat>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
