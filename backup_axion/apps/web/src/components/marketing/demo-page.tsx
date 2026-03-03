'use client'

import { motion } from 'framer-motion'
import { Video, Calendar, ArrowRight, Target, Users, Rocket, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'
import demoContent from '@content/demo-content.json'
import type { DemoContent, DemoSection } from '@/types/content'

const content = demoContent as DemoContent

// Map section IDs to icons
const sectionIcons: Record<string, React.ElementType> = {
  lead_to_campaigns: Target,
  workspaces_pipelines: Users,
  automations: Rocket,
  gdpr_deliverability: Briefcase,
}

export function DemoPage() {
  const { setMarketingPage } = useAppStore()

  const handlePrimaryCta = () => {
    setMarketingPage('contact')
    window.scrollTo(0, 0)
  }

  const handleSecondaryCta = () => {
    setMarketingPage('features')
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-vivid-tangerine/10 blur-3xl" />
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="feature-icon-square bg-vivid-tangerine/10 border-vivid-tangerine/30 mx-auto mb-8" style={{ width: '80px', height: '80px' }}>
                <Video className="h-10 w-10 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="heading-gradient">{content.hero.title}</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-vivid-tangerine mb-4">
                {content.hero.headline}
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8 font-normal">
                {content.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2"
                  onClick={handlePrimaryCta}
                >
                  {content.hero.primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleSecondaryCta}
                >
                  {content.hero.secondaryCta.label}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What You'll See in the Demo */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                What you&apos;ll see in the <span className="heading-highlight curved-underline">demo</span>
              </h2>
            </motion.div>

            <div className="space-y-8">
              {content.demoSections.map((section: DemoSection, i: number) => {
                const IconComponent = sectionIcons[section.id] || Target
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gunmetal border-white/10">
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="feature-icon-square bg-vivid-tangerine/10 border-vivid-tangerine/30 flex-shrink-0">
                            <IconComponent className="h-7 w-7 text-vivid-tangerine" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                            <p className="text-white/60 mb-4 font-normal">{section.description}</p>
                            <ul className="space-y-2">
                              {section.points.map((point, j) => (
                                <li key={j} className="flex items-start gap-3">
                                  <div className="h-1.5 w-1.5 bg-vivid-tangerine mt-2 flex-shrink-0" />
                                  <span className="text-white/70">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Who This Demo Is For */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-8">{content.whoFor.title}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {content.whoFor.audiences.map((audience, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-gunmetal border-white/10 h-full">
                      <CardContent className="p-6 text-center">
                        <p className="text-white/80">{audience}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Next Steps After the Demo */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gunmetal border-white/10">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="feature-icon-square bg-vivid-tangerine/10 border-vivid-tangerine/30">
                      <Calendar className="h-7 w-7 text-vivid-tangerine" />
                    </div>
                    <h2 className="text-2xl font-bold">{content.nextSteps.title}</h2>
                  </div>
                  
                  <p className="text-white/60 mb-4 font-normal">{content.nextSteps.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {content.nextSteps.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 bg-vivid-tangerine/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-vivid-tangerine">{i + 1}</span>
                        </div>
                        <span className="text-white/70">{point}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <p className="text-white/50 text-sm">{content.nextSteps.note}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vivid-tangerine/20 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Ready to see Ori-OS in action?</h2>
              <p className="text-lg text-white/60 mb-8">
                Book a live demo and we&apos;ll walk you through how Ori-OS can replace your current stack.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2"
                  onClick={handlePrimaryCta}
                >
                  {content.cta.primary.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleSecondaryCta}
                >
                  {content.cta.secondary.label}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
