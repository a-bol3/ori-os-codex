'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Send, User, Building, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'

const purposes = [
  'Sales / Demo request',
  'Partnership inquiry',
  'Support question',
  'Press / Media',
  'Other',
]

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    currentStack: '',
    purpose: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-vivid-tangerine" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Let&apos;s talk about your revenue stack
              </h1>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Whether you&apos;re replacing a Frankenstack or starting from scratch, we&apos;d love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gunmetal border-white/10">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gunmetal-light border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-vivid-tangerine/50"
                            placeholder="Your name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gunmetal-light border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-vivid-tangerine/50"
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Company</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gunmetal-light border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-vivid-tangerine/50"
                            placeholder="Company name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Team size</label>
                        <select
                          value={formData.teamSize}
                          onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                          className="w-full px-4 py-3 bg-gunmetal-light border border-white/10 text-white focus:outline-none focus:border-vivid-tangerine/50"
                        >
                          <option value="">Select size</option>
                          <option value="1-3">1-3 people</option>
                          <option value="4-10">4-10 people</option>
                          <option value="11-20">11-20 people</option>
                          <option value="20+">20+ people</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">What tools are you using now?</label>
                      <input
                        type="text"
                        value={formData.currentStack}
                        onChange={(e) => setFormData({ ...formData, currentStack: e.target.value })}
                        className="w-full px-4 py-3 bg-gunmetal-light border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-vivid-tangerine/50"
                        placeholder="e.g., Apollo, HubSpot, Lemlist, Notion..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">Purpose</label>
                      <select
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full px-4 py-3 bg-gunmetal-light border border-white/10 text-white focus:outline-none focus:border-vivid-tangerine/50"
                      >
                        <option value="">Select purpose</option>
                        {purposes.map((purpose) => (
                          <option key={purpose} value={purpose}>{purpose}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">Message</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-gunmetal-light border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-vivid-tangerine/50 resize-none"
                        placeholder="Tell us about your situation..."
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2">
                      Send message
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-4">Other ways to reach us</h3>
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/60">
                <span>Email: hello@ori-craftlabs.com</span>
                <span className="w-1 h-1 bg-white/40" />
                <span>Response time: Usually within 24 hours</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
