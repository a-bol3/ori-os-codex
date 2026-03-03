'use client'

import { Zap, Twitter, Linkedin, Github, Youtube } from 'lucide-react'
import Link from 'next/link'

const footerLinks = {
  product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Roadmap', href: '/roadmap' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api-ref' },
    { label: 'Help Center', href: '/help' },
    { label: 'Community', href: '/community' },
    { label: 'Status', href: '/status' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'GDPR', href: '/gdpr' },
    { label: 'Security', href: '/security' },
  ],
}

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export function MarketingFooter() {
  return (
    <footer className="py-24 px-6 md:px-12 border-t border-white/10 bg-black">
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-8"
            >
              <Zap className="h-6 w-6 text-axion-orange fill-current" />
              <span className="text-2xl font-black tracking-[-0.05em] text-white uppercase">AXION</span>
            </Link>
            <p className="text-sm text-white/40 mb-10 leading-relaxed font-mono uppercase tracking-widest text-[10px]">
              Distribute intelligence. Scale autonomy. The core engine for modern infrastructure teams.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/20 hover:text-axion-orange hover:border-axion-orange/40 transition-all group"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          {['product', 'company', 'resources', 'legal'].map((section) => (
            <div key={section}>
              <h4 className="font-mono font-bold text-white mb-8 text-[10px] uppercase tracking-[0.3em]">{section}</h4>
              <ul className="space-y-6">
                {(footerLinks as any)[section].map((link: any) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[11px] font-mono font-bold text-white/40 hover:text-axion-orange transition-colors uppercase tracking-[0.15em] text-left"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 bg-axion-green animate-pulse" />
            <p className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.4em]">
              © {new Date().getFullYear()} AXION_CORE // SYSTEM_STABLE
            </p>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.2em]">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy_Protocol
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms_Of_Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
