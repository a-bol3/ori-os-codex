'use client'

import { motion } from 'framer-motion'
import {
  Target,
  Users,
  Mail,
  BarChart3,
  Brain,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CounterUp } from '@/components/ui/counter-up'
import { useAppStore } from '@/lib/store'

const bentoItems = [
  {
    title: 'Lead Intelligence',
    description: 'Enrich contacts with 50+ data points automatically',
    icon: Target,
    color: 'from-ori-orange/20 to-transparent',
    size: 'large',
    stat: 50,
    statSuffix: '+',
    statLabel: 'Data Points',
    page: 'intelligence' as const,
  },
  {
    title: 'CRM Built for Sales',
    description: 'Track deals, activities, and relationships in one place',
    icon: Users,
    color: 'from-blue-500/20 to-transparent',
    size: 'medium',
    stat: 100,
    statFormat: 'percentage' as const,
    statLabel: 'Visibility',
    page: 'crm' as const,
  },
  {
    title: 'Email Sequences',
    description: 'Automated multi-touch campaigns with personalization',
    icon: Mail,
    color: 'from-green-500/20 to-transparent',
    size: 'medium',
    stat: 98.5,
    statFormat: 'percentage' as const,
    statDecimals: 1,
    statLabel: 'Deliverability',
    page: 'engagement' as const,
  },
  {
    title: 'Real-time Analytics',
    description: 'Track every metric that matters for your pipeline',
    icon: BarChart3,
    color: 'from-purple-500/20 to-transparent',
    size: 'small',
    stat: 24,
    statSuffix: '/7',
    statLabel: 'Monitoring',
    page: 'analytics' as const,
  },
  {
    title: 'AI-Powered Insights',
    description: 'Get smart recommendations based on your data',
    icon: Brain,
    color: 'from-cyan-500/20 to-transparent',
    size: 'small',
    stat: null, // Text-only stat
    statText: 'AI',
    statLabel: 'Powered',
    page: 'intelligence' as const,
  },
  {
    title: 'Lightning Fast',
    description: 'Built for speed and reliability at scale',
    icon: Zap,
    color: 'from-amber-500/20 to-transparent',
    size: 'small',
    stat: 100,
    statPrefix: '<',
    statSuffix: 'ms',
    statLabel: 'Response Time',
    page: 'features' as const,
  },
]

export function BentoSection() {
  const { setMarketingPage } = useAppStore()
  
  // Extract first item for the large card
  const firstItem = bentoItems[0]
  const FirstIcon = firstItem.icon

  const handleCardClick = (page: typeof bentoItems[0]['page']) => {
    setMarketingPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            <span className="heading-gradient">Find → Enrich → Analyze → Strategize → Engage → Measure → Iterate</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A complete workflow that transforms your go-to-market strategy.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Large Card - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 lg:row-span-2"
          >
            <Card 
              className="bg-ori-panel border-border-subtle hover:border-ori-orange/50 transition-all duration-300 h-full group overflow-hidden cursor-pointer"
              onClick={() => handleCardClick(firstItem.page)}
            >
              <CardContent className="p-8 h-full flex flex-col">
                <div className={`absolute inset-0 bg-gradient-to-br ${firstItem.color}`} />
                <div className="relative">
                  <div className="h-14 w-14 bg-ori-orange/20 border border-ori-orange/30 flex items-center justify-center mb-6">
                    <FirstIcon className="h-7 w-7 text-ori-orange" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">{firstItem.title}</h3>
                  <p className="text-text-secondary mb-6">{firstItem.description}</p>
                  <div className="mt-auto">
                    <div className="text-5xl font-bold text-ori-orange tabular-nums">
                      {firstItem.statPrefix}
                      <CounterUp value={firstItem.stat!} duration={2500} />
                      {firstItem.statSuffix}
                    </div>
                    <div className="text-text-muted">{firstItem.statLabel}</div>
                  </div>
                  <Button variant="ghost" className="mt-6 text-ori-orange hover:text-ori-orange-light hover:bg-ori-orange/10 p-0">
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Medium Cards */}
          {bentoItems.slice(1, 3).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 1) * 0.1 }}
            >
              <Card 
                className="bg-ori-panel border-border-subtle hover:border-ori-orange/50 transition-all duration-300 h-full group overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(item.page)}
              >
                <CardContent className="p-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
                  <div className="relative">
                    <div className="h-10 w-10 bg-ori-panel-light border border-border-subtle flex items-center justify-center mb-4">
                      <item.icon className="h-5 w-5 text-text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                    <p className="text-text-secondary text-sm">{item.description}</p>
                    <div className="mt-4 flex items-baseline gap-2 tabular-nums">
                      <span className="text-2xl font-bold text-ori-orange">
                        {item.statText ? (
                          item.statText
                        ) : (
                          <>
                            {item.statPrefix}
                            <CounterUp 
                              value={item.stat!} 
                              format={item.statFormat}
                              decimals={item.statDecimals ?? 0}
                              duration={2000 + i * 200}
                            />
                            {item.statSuffix}
                          </>
                        )}
                      </span>
                      <span className="text-text-muted text-sm">{item.statLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Small Cards */}
          {bentoItems.slice(3).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 3) * 0.1 }}
            >
              <Card 
                className="bg-ori-panel border-border-subtle hover:border-ori-orange/50 transition-all duration-300 h-full group overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(item.page)}
              >
                <CardContent className="p-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
                  <div className="relative">
                    <div className="h-8 w-8 bg-ori-panel-light border border-border-subtle flex items-center justify-center mb-3">
                      <item.icon className="h-4 w-4 text-text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-1">{item.title}</h3>
                    <p className="text-text-secondary text-xs mb-3">{item.description}</p>
                    <div className="flex items-baseline gap-2 tabular-nums">
                      <span className="text-xl font-bold text-ori-orange">
                        {item.statText ? (
                          item.statText
                        ) : (
                          <>
                            {item.statPrefix}
                            <CounterUp 
                              value={item.stat!}
                              format={item.statFormat}
                              decimals={item.statDecimals ?? 0}
                              duration={2200 + i * 200}
                            />
                            {item.statSuffix}
                          </>
                        )}
                      </span>
                      <span className="text-text-muted text-xs">{item.statLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
