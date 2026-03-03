'use client'

import { motion } from 'framer-motion'
import { CounterUp } from '@/components/ui/counter-up'

const stats = [
  { value: 50000, label: 'Contacts Managed', format: 'compact' as const, suffix: '+' },
  { value: 2000000, label: 'Emails Sent', format: 'compact' as const, suffix: '+' },
  { value: 98.5, label: 'Deliverability Rate', format: 'percentage' as const, decimals: 1 },
  { value: 45, label: 'Avg Response Rate', format: 'percentage' as const },
]

export function StatsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border-subtle bg-ori-panel/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-ori-orange mb-2 tabular-nums">
                <CounterUp
                  value={stat.value}
                  format={stat.format}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? (stat.format === 'percentage' && stat.value % 1 !== 0 ? 1 : 0)}
                  duration={2000 + i * 200}
                />
              </div>
              <div className="text-sm text-text-secondary">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
