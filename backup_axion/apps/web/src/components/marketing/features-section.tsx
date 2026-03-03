'use client'

import { motion } from 'framer-motion'
import {
  Cpu,
  Database,
  ShieldAlert,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { CardFeature } from '@/components/ui/card'

const features = [
  {
    fig: '01',
    icon: Database,
    title: 'Data Ingestion',
    description: 'Real-time pipelines processing millions of events per second across distributed shards.',
  },
  {
    fig: '02',
    icon: Cpu,
    title: 'Core Processing',
    description: 'Autonomous logic engines that adapt to workload demands in sub-millisecond timeframes.',
  },
  {
    fig: '03',
    icon: ShieldAlert,
    title: 'Security Protocol',
    description: 'SOC2 Type II compliant architecture with AES-256 encryption at rest and in transit.',
  },
  {
    fig: '04',
    icon: BarChart3,
    title: 'System Telemetry',
    description: 'Granular observability with real-time dashboards and predictive anomaly detection.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 md:px-12 bg-black border-t border-white/10">
      <div className="max-w-[1920px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 text-axion-orange font-mono text-[10px] tracking-[0.2em] uppercase mb-4">
              <div className="h-1.5 w-1.5 bg-axion-orange" />
              // Core_Capabilities
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-white leading-none uppercase tracking-tight">
              Infrastructure <span className="text-white/20">Primitives</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:text-right"
          >
            <p className="text-white/40 text-lg max-w-md lg:ml-auto mb-6">
              The four pillars of the Axion Engine. Modular, scalable, and secure by design.
            </p>
            <button className="text-[10px] font-mono font-bold text-white/60 hover:text-white uppercase tracking-[0.3em] transition-colors">
              Explore All Features
            </button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group border-r border-b border-white/10 p-10 flex flex-col min-h-[400px] hover:bg-white/5 transition-all relative overflow-hidden"
            >
              {/* Fig Label */}
              <div className="flex justify-between items-start mb-12">
                <div className="px-2 py-1 border border-white/10 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                  FIG. {feature.fig}
                </div>
                <feature.icon size={24} className="text-white/20 group-hover:text-axion-orange transition-colors" />
              </div>

              <div className="mt-auto">
                <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  {feature.description}
                </p>
                <button className="flex items-center gap-2 text-[9px] font-mono font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-[0.2em]">
                  Read Specs
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-white/0 group-hover:border-axion-orange/30 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
