'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import homeContent from '@content/home-content.json'
import type { TestimonialsContent, TestimonialCard } from '@/types/content'

const content = homeContent.testimonials as TestimonialsContent

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Duplicate cards for infinite scroll
  const allCards = [...content.cards, ...content.cards]

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % content.cards.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + content.cards.length) % content.cards.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % content.cards.length)
  }

  return (
    <section id="testimonials" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Loved by Revenue <span className="heading-highlight curved-underline">Teams</span>
          </h2>
          <p className="text-lg text-white/60 font-normal">
            {content.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Carousel - full width with gradients */}
      <div className="relative">
        {/* Gradient overlays - extend to page edges */}
        <div className="absolute left-0 top-0 bottom-0 w-[15%] min-w-[150px] bg-gradient-to-r from-coffee-bean via-coffee-bean/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-[15%] min-w-[150px] bg-gradient-to-l from-coffee-bean via-coffee-bean/90 to-transparent z-10 pointer-events-none" />

        {/* Cards Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={containerRef}
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / 2)}%)`,
            }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {allCards.map((card: TestimonialCard, i: number) => (
              <div
                key={`${card.id}-${i}`}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)]"
              >
                <Card className="bg-gunmetal border-white/10 h-full hover:border-vivid-tangerine/30 transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-vivid-tangerine text-vivid-tangerine" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-white/80 mb-6 text-lg leading-relaxed">
                      &ldquo;{card.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-vivid-tangerine/30">
                        <AvatarFallback className="bg-vivid-tangerine text-white font-medium">
                          {getInitials(card.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{card.name}</p>
                        <p className="text-sm text-white/60">{card.role}, {card.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 text-white hover:bg-white/10 hover:border-vivid-tangerine/50"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots indicator */}
            <div className="flex items-center gap-2">
              {content.cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAutoPlaying(false)
                    setCurrentIndex(i)
                  }}
                  className={`w-2 h-2 transition-all ${
                    currentIndex === i
                      ? 'bg-vivid-tangerine w-4'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="border-white/20 text-white hover:bg-white/10 hover:border-vivid-tangerine/50"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
