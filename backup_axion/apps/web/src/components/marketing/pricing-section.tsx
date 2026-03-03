'use client'

import { motion } from 'framer-motion'
import { Check, Cpu, Shield, Zap, Globe, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const pricingPlans = [
  {
    name: 'Developer Mode',
    price: '$0',
    description: 'Sandbox environment for integration testing and prototype development.',
    features: [
      'Shared Compute',
      'Standard API Cap',
      'Community Support',
    ],
    cta: 'Start Trial',
    level: '01',
    icon: Cpu,
  },
  {
    name: 'Enterprise Mode',
    price: 'Custom',
    description: 'Full production deployment with guaranteed resources and SLA enforcement.',
    features: [
      'Unlimited Scaling',
      '99.99% SLA Uptime',
      '24/7 Priority Support',
    ],
    cta: 'Request Demo',
    highlighted: true,
    level: '02',
    icon: Server,
  },
  {
    name: 'Custom Infra',
    price: 'Custom',
    description: 'Dedicated clusters, on-premise deployment options, and custom compliance.',
    features: [
      'Dedicated Hardware',
      'Custom Compliance',
      'On-Premise / Air-Gapped',
    ],
    cta: 'Contact Sales',
    level: '03',
    icon: Shield,
  },
]

export function PricingSection() {
  const { setCurrentView } = useAppStore()

  const handleStart = () => {
    setCurrentView('dashboard')
  }

  return (
    <section id="pricing" className="py-32 px-6 md:px-12 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-axion-orange/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1920px] mx-auto relative z-10 text-center uppercase">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tight">
            System <span className="text-white/20">Access</span>
          </h2>
          <p className="text-white/40 text-sm md:text-base font-mono max-w-2xl mx-auto tracking-widest leading-relaxed">
            Select infrastructure tier for immediate provisioning. Access credentials generated upon verification.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-px bg-white/10 max-w-7xl mx-auto border border-white/10">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative bg-black transition-all duration-500 flex flex-col p-12",
                plan.highlighted ? "z-20 scale-105 shadow-[0_0_80px_rgba(255,92,0,0.15)] border-x border-axion-orange/30" : "z-10"
              )}
            >
              {plan.highlighted && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-axion-orange" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-axion-orange text-[9px] font-black text-black tracking-widest">
                    RECOMMENDED
                  </div>
                  {/* Inner Ring Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-axion-orange/50 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-axion-orange/30 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-axion-orange/20 rounded-full" />
                  </div>
                </>
              )}

              <div className="mb-12">
                <div className="text-[10px] font-mono text-white/30 mb-8 tracking-widest">
                  LEVEL_{plan.level}
                </div>
                <plan.icon size={32} className={cn("mx-auto mb-8 transition-colors", plan.highlighted ? "text-axion-orange" : "text-white/20")} />
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">
                  {plan.name}
                </h3>
                {plan.highlighted ? (
                  <div className="text-white/40 font-mono text-xs tracking-widest mt-4">99.99% SLA UPTIME</div>
                ) : (
                  <p className="text-white/40 text-[11px] max-w-[200px] mx-auto normal-case leading-relaxed font-mono">
                    {plan.description}
                  </p>
                )}
              </div>

              <div className="mt-auto">
                <div className="h-px bg-white/10 w-full mb-12" />

                <ul className="space-y-6 mb-12">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center justify-center gap-3 text-[10px] font-bold text-white/60 tracking-widest">
                      <Zap size={10} className={cn(plan.highlighted ? "text-axion-orange fill-current" : "text-white/20")} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full py-8 font-black text-xs tracking-tighter uppercase",
                    plan.highlighted ? "bg-axion-orange text-black hover:bg-orange-500" : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white"
                  )}
                  onClick={handleStart}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
