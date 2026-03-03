'use client'

import { motion } from 'framer-motion'
import { Briefcase, Users, MapPin, Heart, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

const benefits = [
  { icon: Briefcase, title: 'Lean team, real ownership', description: 'Direct impact on agencies and tech SMEs.' },
  { icon: MapPin, title: 'EU-based, remote-friendly', description: 'Work from anywhere in Europe.' },
  { icon: Heart, title: 'Customer-obsessed culture', description: 'We talk to users weekly.' },
  { icon: Clock, title: 'Sustainable pace', description: 'We build for the long term.' },
]

const futureRoles = [
  { title: 'Founding Product Engineer', description: 'Full-stack development with product ownership' },
  { title: 'Founding RevOps/CS', description: 'Shape customer success from the ground up' },
  { title: 'Founding Marketer/Content', description: 'Build our content and community presence' },
]

export function CareersPage() {
  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Help build the Revenue OS for lean B2B teams
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                We&apos;re a small, focused team. We value deep work, customer obsession, and thoughtful engineering.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why Join */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Why join Ori-CraftLabs</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 h-full text-center">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-4">
                        <benefit.icon className="h-6 w-6 text-vivid-tangerine" />
                      </div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-white/60">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Hiring Philosophy */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-4">Our hiring philosophy</h2>
              <p className="text-white/60">
                We hire slowly, for critical roles. When we&apos;re not actively hiring, you can still send 
                a short note and examples of your work. We&apos;ll keep it on file for when positions open up.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Future Roles */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Future roles</h2>
              <p className="text-white/60">We&apos;re not actively hiring right now, but we expect to add:</p>
            </motion.div>

            <div className="space-y-4">
              {futureRoles.map((role, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold mb-1">{role.title}</h3>
                          <p className="text-sm text-white/60">{role.description}</p>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Future opening
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vivid-tangerine/20 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Interested in joining us?</h2>
              <p className="text-lg text-white/60 mb-8">
                Share your work and a short note. We&apos;ll keep you in the loop as we grow.
              </p>
              <Button size="lg" className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2" onClick={() => window.location.href = 'mailto:careers@ori-craftlabs.com'}>
                careers@ori-craftlabs.com
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
