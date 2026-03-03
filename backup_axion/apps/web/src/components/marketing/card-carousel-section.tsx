'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CardCarouselSection as CardCarouselSectionType } from '@/types/content'

interface CardCarouselSectionProps {
  section: CardCarouselSectionType
  onCardClick?: (href: string) => void
}

export function CardCarouselSection({ section, onCardClick }: CardCarouselSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)

  const cards = section.cards
  const totalCards = cards.length

  // Duplicate cards for infinite scroll effect
  const displayCards = [...cards, ...cards]

  // Calculate cards per view based on viewport
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 2
    return window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3
  }

  const [cardsPerView, setCardsPerView] = useState(2)

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView())
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || isDragging) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalCards)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, isDragging, totalCards])

  const handlePrev = useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards)
  }, [totalCards])

  const handleNext = useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % totalCards)
  }, [totalCards])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    },
    [handlePrev, handleNext]
  )

  // Drag/Touch handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStartX(clientX)
  }

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    setIsDragging(false)

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const diff = dragStartX - clientX

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
  }

  const handleCardClick = (href: string) => {
    if (onCardClick) {
      onCardClick(href)
    }
  }

  // Calculate transform
  const cardWidth = 100 / cardsPerView
  const transform = `translateX(-${currentIndex * cardWidth}%)`

  return (
    <section
      id={section.id}
      className="py-24 overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label={section.title}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </div>

      {/* Carousel Container */}
      <div
        className="relative"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => !isDragging && setIsAutoPlaying(true)}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Carousel controls"
      >
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-[10%] min-w-[80px] bg-gradient-to-r from-ori-black via-ori-black/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-[10%] min-w-[80px] bg-gradient-to-l from-ori-black via-ori-black/90 to-transparent z-10 pointer-events-none" />

        {/* Cards Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{ transform }}
          >
            {displayCards.map((card, i) => (
              <div
                key={`${card.id}-${i}`}
                className="flex-shrink-0"
                style={{ width: `calc(${cardWidth}% - ${(cardsPerView - 1) * 6 / cardsPerView}px)` }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i % totalCards + 1} of ${totalCards}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % totalCards) * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card className="bg-ori-panel border-border-subtle h-full hover:border-ori-orange/40 transition-all duration-200 group cursor-pointer">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Top: Label & Tag */}
                      <div className="flex items-center justify-between mb-3">
                        {card.label && (
                          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                            {card.label}
                          </span>
                        )}
                        {card.tag && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-vivid-tangerine/30 text-vivid-tangerine bg-vivid-tangerine/10"
                          >
                            {card.tag}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-ori-orange transition-colors duration-150">
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-text-secondary leading-relaxed flex-grow mb-4">
                        {card.description}
                      </p>

                      {/* CTA */}
                      {card.cta && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCardClick(card.href)
                          }}
                          className="flex items-center gap-2 text-sm font-medium text-ori-orange hover:text-ori-orange-light transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ori-orange focus-visible:ring-offset-2 focus-visible:ring-offset-ori-panel"
                          aria-label={card.cta}
                        >
                          {card.cta}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-150" />
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
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
              className="border-border-subtle text-text-primary hover:bg-ori-panel hover:border-ori-orange/50 focus-visible:ring-2 focus-visible:ring-ori-orange focus-visible:ring-offset-2 focus-visible:ring-offset-ori-black"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots indicator */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Carousel slides">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAutoPlaying(false)
                    setCurrentIndex(i)
                  }}
                  role="tab"
                  aria-selected={currentIndex === i}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-2 h-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ori-orange ${
                    currentIndex === i
                      ? 'bg-ori-orange w-4'
                      : 'bg-text-muted hover:bg-text-secondary'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="border-border-subtle text-text-primary hover:bg-ori-panel hover:border-ori-orange/50 focus-visible:ring-2 focus-visible:ring-ori-orange focus-visible:ring-offset-2 focus-visible:ring-offset-ori-black"
              onClick={handleNext}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
