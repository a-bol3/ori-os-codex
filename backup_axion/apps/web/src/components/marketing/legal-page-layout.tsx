'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarketingHeader } from './marketing-header'
import { MarketingFooter } from './marketing-footer'
import { useAppStore } from '@/lib/store'

interface LegalPageLayoutProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  const { setMarketingPage } = useAppStore()

  return (
    <div className="min-h-screen bg-coffee-bean text-white">
      <MarketingHeader />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setMarketingPage('home')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-vivid-tangerine/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-vivid-tangerine" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
            </div>
            <p className="text-white/60">Last updated: {lastUpdated}</p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-invert prose-orange max-w-none"
          >
            <style jsx global>{`
              .prose h2 {
                color: white;
                font-size: 1.5rem;
                font-weight: 600;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              }
              .prose h3 {
                color: white;
                font-size: 1.25rem;
                font-weight: 600;
                margin-top: 2rem;
                margin-bottom: 0.75rem;
              }
              .prose p {
                color: rgba(255, 255, 255, 0.7);
                line-height: 1.75;
                margin-bottom: 1rem;
              }
              .prose ul {
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 1rem;
                padding-left: 1.5rem;
              }
              .prose li {
                margin-bottom: 0.5rem;
              }
              .prose strong {
                color: white;
                font-weight: 600;
              }
              .prose a {
                color: #f77f00;
                text-decoration: underline;
              }
              .prose a:hover {
                color: #ff9933;
              }
            `}</style>
            {children}
          </motion.div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
