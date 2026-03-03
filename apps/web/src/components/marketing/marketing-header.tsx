'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, cn } from '@ori-os/ui';
import { Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
    {
        label: 'Product',
        href: '#',
        children: [
            { label: 'Intelligence', href: '/features/intelligence', description: 'Find & enrich leads at scale' },
            { label: 'CRM', href: '/features/crm', description: 'Unified relationship hub' },
            { label: 'Automation', href: '/features/automation', description: 'Visual workflow builder' },
            { label: 'Engagement', href: '/features/engagement', description: 'Multi-channel outreach' },
            { label: 'Analytics', href: '/features/analytics', description: 'Deep insights & funnels' },
            { label: 'Content', href: '/features/content', description: 'AI-powered content ops' },
        ],
    },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
];

export function MarketingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
                    : 'bg-transparent'
            )}
        >
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-none bg-gradient-to-br from-tangerine to-tangerine/80 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">O</span>
                        </div>
                        <span className="font-semibold text-xl text-foreground">
                            Ori-OS
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <div
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
                                        'rounded-none hover:bg-muted/50'
                                    )}
                                >
                                    {item.label}
                                    {item.children && (
                                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                    )}
                                </Link>

                                {/* Dropdown */}
                                {item.children && activeDropdown === item.label && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 w-72 p-2 rounded-none bg-popover border border-border shadow-glass-lg"
                                    >
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                className="block p-3 rounded-none hover:bg-muted transition-colors group"
                                            >
                                                <div className="font-medium text-foreground group-hover:text-tangerine transition-colors">
                                                    {child.label}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {child.description}
                                                </div>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Log in</Link>
                        </Button>
                        <Button variant="accent" asChild>
                            <Link href="/register">Get Started</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-border py-4"
                    >
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <div key={item.label}>
                                    {item.children ? (
                                        <div className="space-y-1">
                                            <div className="px-4 py-2 text-sm font-medium text-foreground">
                                                {item.label}
                                            </div>
                                            <div className="pl-4 space-y-1">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.label}
                                                        href={child.href}
                                                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                            <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border mt-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button variant="accent" className="w-full" asChild>
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>
        </header>
    );
}
