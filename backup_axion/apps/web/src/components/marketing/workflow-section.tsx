'use client'

import { motion } from 'framer-motion'
import {
  Search,
  Database,
  BarChart3,
  FileText,
  Mail,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Target,
  LucideIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import homeContent from '@content/home-content.json'
import type { HomeWorkflowContent, WorkflowStep } from '@/types/content'
import { useAppStore } from '@/lib/store'

const content = homeContent.workflow as HomeWorkflowContent

// Map step IDs to icons
const stepIcons: Record<string, LucideIcon> = {
  find: Search,
  enrich: Database,
  analyze: BarChart3,
  strategize: FileText,
  engage: Mail,
  measure: TrendingUp,
  iterate: RefreshCw,
}

// Map step IDs to colors
const stepColors: Record<string, { bg: string; text: string; border: string }> = {
  find: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  enrich: { bg: 'bg-vivid-tangerine/10', text: 'text-vivid-tangerine', border: 'border-vivid-tangerine/30' },
  analyze: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  strategize: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  engage: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  measure: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  iterate: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
}

export function WorkflowSection() {
  const { setMarketingPage } = useAppStore()

  const handleLearnMore = () => {
    setMarketingPage('features')
    // Use setTimeout to allow the page to render first
    setTimeout(() => {
      const element = document.getElementById('lead-intelligence')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }
  
  return (
    <section data-workflow-section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-normal">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Workflow Steps - Horizontal Scroll on Mobile */}
        <div className="mb-16">
          {/* Steps Flow */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-0 md:justify-between items-start">
            {content.steps.map((step: WorkflowStep, i: number) => {
              const IconComponent = stepIcons[step.id] || Search
              const colors = stepColors[step.id] || { bg: 'bg-white/5', text: 'text-white', border: 'border-white/20' }
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center w-[140px] md:w-auto"
                >
                  {/* Step Square Icon */}
                  <div className={`feature-icon-square ${colors.bg} ${colors.border} mb-3`}>
                    <IconComponent className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  
                  {/* Step Title - Bold */}
                  <h3 className="font-bold text-white text-center mb-1">{step.title}</h3>
                  
                  {/* Step Description - Normal text, hidden on mobile */}
                  <p className="text-xs text-white/50 text-center hidden md:block max-w-[120px] font-normal">
                    {step.description}
                  </p>

                  {/* Connector Arrow - Hidden on last item */}
                  {i < content.steps.length - 1 && (
                    <div className="hidden md:flex items-center mx-2 text-white/20">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Mobile: Horizontal scroll for step details */}
          <div className="md:hidden mt-8 overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {content.steps.map((step: WorkflowStep, i: number) => {
                const colors = stepColors[step.id] || { bg: 'bg-white/5', text: 'text-white', border: 'border-white/20' }
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gunmetal border-white/10 w-[200px]">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-sm mb-2">{step.title}</h4>
                        <p className="text-xs text-white/60 font-normal">{step.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Feature Card - Lead Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-gunmetal border-white/10 hover:border-vivid-tangerine/50 transition-all duration-300 group overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Square Icon */}
                <div className="feature-icon-square bg-vivid-tangerine/10 border-vivid-tangerine/30 flex-shrink-0" style={{ width: '64px', height: '64px' }}>
                  <Target className="h-8 w-8 text-vivid-tangerine" />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  {/* Bold Title */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {content.featureCard.title}
                  </h3>
                  {/* Normal Description */}
                  <p className="text-white/60 mb-4 font-normal">
                    {content.featureCard.subtitle}
                  </p>
                  
                  {/* Metric */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-vivid-tangerine">
                      {content.featureCard.metricValue}
                    </span>
                    <span className="text-white/40 text-sm font-normal">
                      {content.featureCard.metricLabel}
                    </span>
                  </div>
                </div>
                
                {/* CTA */}
                <div className="md:self-end">
                  <Button
                    variant="ghost"
                    className="text-vivid-tangerine hover:text-vivid-tangerine hover:bg-vivid-tangerine/10 gap-2 group"
                    onClick={handleLearnMore}
                  >
                    {content.featureCard.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
