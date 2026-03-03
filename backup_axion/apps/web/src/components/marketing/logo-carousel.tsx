'use client'

import { motion } from 'framer-motion'
import homeContent from '@content/home-content.json'
import type { TrustLogosContent } from '@/types/content'

const content = homeContent.trustLogos as TrustLogosContent

// Duplicate logos array for seamless loop
const duplicatedLogos = [...content.logos, ...content.logos]

export function LogoCarousel() {
  return (
    <section className="py-12 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <p className="text-sm font-medium text-white/40 uppercase tracking-wider">
            {content.title}
          </p>
        </motion.div>
      </div>

      {/* Logo Carousel - full width with gradients */}
      <div className="relative">
        {/* Gradient overlays - extend to page edges */}
        <div className="absolute left-0 top-0 bottom-0 w-[15%] min-w-[120px] bg-gradient-to-r from-coffee-bean via-coffee-bean/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-[15%] min-w-[120px] bg-gradient-to-l from-coffee-bean via-coffee-bean/90 to-transparent z-10 pointer-events-none" />

        {/* Scrolling container */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {duplicatedLogos.map((logo, i) => (
            <div
              key={`${logo.id}-${i}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <div className="h-12 px-6 flex items-center justify-center bg-gunmetal/50 border border-white/5 hover:border-vivid-tangerine/30 transition-colors">
                <span className="text-lg font-semibold text-white/60 whitespace-nowrap">
                  {logo.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
