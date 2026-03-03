'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function MarketingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'System Core', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Docs', href: '/docs' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-black">
      <nav className="h-full max-w-[1920px] mx-auto flex items-stretch">
        {/* Logo Segment */}
        <div className="flex items-center px-6 border-r border-white/10 min-w-[140px] md:min-w-[180px]">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Zap className="h-5 w-5 text-axion-orange fill-current" />
            <span className="text-xl font-black tracking-[-0.05em] text-white">AXION</span>
          </Link>
        </div>

        {/* Status Segment - Hidden on Small Screens */}
        <div className="hidden lg:flex items-center px-6 border-r border-white/10">
          <div className="flex items-center gap-3 px-3 py-1.5 border border-white/5 bg-white/5">
            <div className="h-2 w-2 rounded-full bg-axion-green animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-white/40 tracking-widest uppercase">
              [ ENV: <span className="text-white">PRODUCTION</span> ]
            </span>
          </div>
        </div>

        {/* Navigation Segments - Desktop */}
        <div className="hidden md:flex flex-1 items-stretch overflow-hidden">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex-1 px-4 flex items-center justify-center border-r border-white/10 text-[10px] font-mono font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.15em] whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth / CTA Segments */}
        <div className="flex items-stretch flex-1 md:flex-initial">
          <Link
            href="/dashboard"
            className="hidden sm:flex flex-1 md:flex-initial px-8 items-center justify-center border-r border-white/10 text-[10px] font-mono font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-[0.15em]"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 md:flex-initial px-4 md:px-10 flex items-center justify-center bg-axion-orange text-black font-black text-xs uppercase tracking-tighter hover:bg-orange-500 transition-all group"
          >
            <span className="hidden xs:inline">Request Demo</span>
            <span className="xs:hidden">Demo</span>
            <Zap className="ml-2 h-4 w-4 fill-current group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden px-4 flex items-center justify-center border-l border-white/10 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-black border-b border-white/10 p-6 space-y-4 md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block w-full text-left text-[12px] font-mono font-bold text-white/60 hover:text-axion-orange uppercase tracking-widest py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/5">
              <Link
                href="/dashboard"
                className="block w-full text-center bg-white/5 border border-white/10 text-white py-3 font-mono text-[10px] tracking-widest uppercase"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
