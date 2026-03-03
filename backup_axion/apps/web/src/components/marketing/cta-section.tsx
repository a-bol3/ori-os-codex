'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function CTASection() {
  const { setCurrentView, setMarketingPage } = useAppStore()

  const handleStartTrial = () => {
    setCurrentView('dashboard')
    window.scrollTo(0, 0)
  }

  const handleTalkToSales = () => {
    setMarketingPage('contact')
    window.scrollTo(0, 0)
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-vivid-tangerine/20 via-transparent to-vivid-tangerine/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vivid-tangerine/10 blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your <span className="heading-highlight curved-underline">Pipeline</span>?
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto font-normal">
            Join thousands of revenue teams using Ori-OS to close more deals.
            Start your free trial today—no credit card required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2 h-12 px-8" onClick={handleStartTrial}>
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8" onClick={handleTalkToSales}>
              Talk to Sales
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-white/40">
            <span>No credit card required</span>
            <span className="hidden sm:inline">•</span>
            <span>14-day free trial</span>
            <span className="hidden sm:inline">•</span>
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
