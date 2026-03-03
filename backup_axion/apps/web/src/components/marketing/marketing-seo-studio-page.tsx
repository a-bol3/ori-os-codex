'use client'

import { motion } from 'framer-motion'
import {
  Search,
  Building2,
  Target,
  Sparkles,
  Globe,
  ListChecks,
  BarChart3,
  Lightbulb,
  Link,
  Eye,
  Mail,
  Workflow,
  TrendingUp,
  DollarSign,
  Shield,
  ArrowRight,
  Check,
  LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { CardCarouselSection } from './card-carousel-section'
import { useAppStore } from '@/lib/store'
import seoStudioContent from '@content/product/seo-studio.json'
import type { SeoStudioContent, SeoStudioSection } from '@/types/content'

const content = seoStudioContent as SeoStudioContent

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Search,
  Building2,
  Target,
  Sparkles,
  Globe,
  ListChecks,
  BarChart3,
  Lightbulb,
  Link,
  Eye,
  Mail,
  Workflow,
  TrendingUp,
  DollarSign,
  Shield,
}

export function MarketingSeoStudioPage() {
  const { setMarketingPage, setCurrentView } = useAppStore()

  const handlePrimaryCta = () => {
    const href = content.hero.primaryCta.href
    if (href === 'pricing') {
      setMarketingPage('pricing')
    } else if (href === 'dashboard' || href === 'trial') {
      setCurrentView('dashboard')
    } else {
      setMarketingPage(href as any)
    }
    window.scrollTo(0, 0)
  }

  const handleSecondaryCta = () => {
    const href = content.hero.secondaryCta.href
    if (href === 'features') {
      setMarketingPage('features')
    } else if (href === 'dashboard' || href === 'trial') {
      setCurrentView('dashboard')
    } else {
      setMarketingPage(href as any)
    }
    window.scrollTo(0, 0)
  }

  const handleSectionCta = (href: string) => {
    if (href === 'pricing') {
      setMarketingPage('pricing')
    } else if (href === 'contact') {
      setMarketingPage('contact')
    } else if (href === 'features') {
      setMarketingPage('features')
    } else if (href === 'dashboard' || href === 'trial') {
      setCurrentView('dashboard')
    } else {
      setMarketingPage(href as any)
    }
    window.scrollTo(0, 0)
  }

  const renderSection = (section: SeoStudioSection, index: number) => {
    const isOdd = index % 2 === 1
    const bgClass = isOdd ? 'bg-gunmetal/30' : ''

    if (section.layout === 'steps') {
      return (
        <section key={section.id} className={`py-24 px-4 sm:px-6 lg:px-8 ${bgClass}`}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="heading-gradient">{section.title}</span>
              </h2>
              {section.subtitle && (
                <p className="text-lg text-white/60 max-w-2xl mx-auto">{section.subtitle}</p>
              )}
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {section.steps?.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 bg-vivid-tangerine/20 flex items-center justify-center">
                          <span className="text-lg font-bold text-vivid-tangerine">{i + 1}</span>
                        </div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-white/60">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {section.cta && (
              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-vivid-tangerine hover:bg-tangerine-dark text-white gap-2"
                  onClick={() => handleSectionCta(section.cta!.href)}
                >
                  {section.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )
    }

    if (section.layout === 'single') {
      const IconComponent = section.icon ? iconMap[section.icon] : Shield
      return (
        <section key={section.id} className={`py-24 px-4 sm:px-6 lg:px-8 ${bgClass}`}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gunmetal border-white/10">
                <CardContent className="p-8">
                  {IconComponent && (
                    <div className="h-14 w-14 bg-vivid-tangerine/20 flex items-center justify-center mb-6">
                      <IconComponent className="h-7 w-7 text-vivid-tangerine" />
                    </div>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    <span className="heading-gradient">{section.title}</span>
                  </h2>
                  {section.body && (
                    <p className="text-lg text-white/60 mb-6">{section.body}</p>
                  )}
                  {section.bullets && (
                    <ul className="space-y-3">
                      {section.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="h-6 w-6 bg-vivid-tangerine/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-4 w-4 text-vivid-tangerine" />
                          </div>
                          <span className="text-white/80">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.points && (
                    <ul className="space-y-3">
                      {section.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="h-6 w-6 bg-vivid-tangerine/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-4 w-4 text-vivid-tangerine" />
                          </div>
                          <span className="text-white/80">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )
    }

    // Default columns layout
    return (
      <section key={section.id} className={`py-24 px-4 sm:px-6 lg:px-8 ${bgClass}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="heading-gradient">{section.title}</span>
            </h2>
            {section.subtitle && (
              <p className="text-lg text-white/60 max-w-2xl mx-auto">{section.subtitle}</p>
            )}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {section.columns?.map((column, i) => {
              const IconComponent = column.icon ? iconMap[column.icon] : null
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gunmetal border-white/10 h-full hover:border-vivid-tangerine/50 transition-all">
                    <CardContent className="p-6">
                      {IconComponent && (
                        <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center mb-4">
                          <IconComponent className="h-6 w-6 text-vivid-tangerine" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold mb-3">{column.title}</h3>
                      <p className="text-white/60 mb-4">{column.body}</p>
                      <ul className="space-y-2">
                        {column.points.map((point, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                            <Check className="h-4 w-4 text-vivid-tangerine flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-vivid-tangerine/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                {content.hero.badge && (
                  <Badge className="mb-6 bg-vivid-tangerine/20 text-vivid-tangerine border-vivid-tangerine/30">
                    <Search className="h-3 w-3 mr-1" />
                    {content.hero.badge}
                  </Badge>
                )}
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="heading-gradient">{content.hero.title}</span>
                  <span className="curved-underline"> – </span>
                  <span className="heading-highlight">{content.hero.titleHighlight}</span>
                </h1>
                <p className="text-xl text-white/60 mb-8">
                  {content.hero.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
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
              </div>

              <div className="relative">
                <div className="bg-gunmetal border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-vivid-tangerine/20 flex items-center justify-center">
                      <Search className="h-5 w-5 text-vivid-tangerine" />
                    </div>
                    <div>
                      <p className="font-medium">SEO Dashboard</p>
                      <p className="text-sm text-white/60">All your inbound metrics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                      { label: 'Organic Clicks', value: '12.4K' },
                      { label: 'Avg Position', value: '14.2' },
                      { label: 'Top Keywords', value: '847' },
                      { label: 'Issues Fixed', value: '23' },
                    ].map((metric, i) => (
                      <div key={i} className="bg-gunmetal-light p-3">
                        <p className="text-xs text-white/40">{metric.label}</p>
                        <p className="text-xl font-bold text-white">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-20 bg-gunmetal-light flex items-center justify-center">
                    <div className="flex items-end gap-1 h-12">
                      {[40, 65, 55, 80, 70, 90, 85, 95].map((h, i) => (
                        <div
                          key={i}
                          className="w-4 bg-vivid-tangerine/50"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Render first carousel (SEO Projects) after hero */}
        {content.carousels && content.carousels[0] && (
          <CardCarouselSection
            section={content.carousels[0]}
            onCardClick={handleSectionCta}
          />
        )}

        {/* Render all sections */}
        {content.sections.map((section, index) => renderSection(section, index))}

        {/* Render second carousel (Case Studies) before final CTA */}
        {content.carousels && content.carousels[1] && (
          <CardCarouselSection
            section={content.carousels[1]}
            onCardClick={handleSectionCta}
          />
        )}

        {/* Final CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-vivid-tangerine/20 via-transparent to-vivid-tangerine/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                <span className="heading-gradient">Ready to unify your inbound and outbound?</span>
              </h2>
              <p className="text-lg text-white/60 mb-8">
                SEO Studio brings keyword research, technical audits, and content analysis into the same OS that runs your revenue.
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
                  onClick={() => {
                    setMarketingPage('contact')
                    window.scrollTo(0, 0)
                  }}
                >
                  Talk to Sales
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
