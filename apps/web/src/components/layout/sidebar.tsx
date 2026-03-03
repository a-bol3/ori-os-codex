'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Button,
    ScrollArea,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    Separator,
    cn,
} from '@ori-os/ui';
import { UserAccount } from './user-account';
import {
    LayoutDashboard,
    Search,
    Users,
    Building2,
    DollarSign,
    CreditCard,
    GitBranch,
    Mail,
    BarChart3,
    FileText,
    Settings,
    HelpCircle,
    ChevronLeft,
    X,
    Sparkles,
} from 'lucide-react';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Intelligence',
        href: '/dashboard/intelligence',
        icon: Search,
        badge: 'AI',
    },
    {
        title: 'Contacts',
        href: '/dashboard/crm/contacts',
        icon: Users,
    },
    {
        title: 'Companies',
        href: '/dashboard/crm/companies',
        icon: Building2,
    },
    {
        title: 'Deals',
        href: '/dashboard/crm/deals',
        icon: DollarSign,
    },
    {
        title: 'Billing',
        href: '/dashboard/billing',
        icon: CreditCard,
        badge: 'New',
    },
    {
        title: 'Automation',
        href: '/dashboard/automation',
        icon: GitBranch,
    },
    {
        title: 'Engagement',
        href: '/dashboard/engagement',
        icon: Mail,
    },
    {
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
    },
    {
        title: 'SEO Studio',
        href: '/dashboard/seo',
        icon: Search,
        badge: 'New',
    },
    {
        title: 'Content',
        href: '/dashboard/content',
        icon: FileText,
    },
];

const bottomNavItems = [
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
    {
        title: 'Help',
        href: '/dashboard/help',
        icon: HelpCircle,
    },
];

interface SidebarProps {
    collapsed: boolean;
    onCollapse: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

export function Sidebar({
    collapsed,
    onCollapse,
    mobileOpen,
    onMobileClose,
}: SidebarProps) {
    const pathname = usePathname();

    const NavItem = ({
        item,
        isActive,
    }: {
        item: (typeof mainNavItems)[0];
        isActive: boolean;
    }) => {
        const content = (
            <Link
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-none transition-all duration-200 group relative',
                    isActive
                        ? 'bg-tangerine/10 text-tangerine'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
            >
                <item.icon
                    className={cn(
                        'h-5 w-5 shrink-0 transition-transform duration-200 text-tangerine group-hover:-translate-y-[1px]'
                    )}
                />
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                            {item.title}
                        </motion.span>
                    )}
                </AnimatePresence>
                {'badge' in item && item.badge && !collapsed && (
                    <span className="ml-auto px-1.5 py-0.5 text-2xs font-medium bg-tangerine/10 text-tangerine rounded-none">
                        {item.badge}
                    </span>
                )}
                {isActive && (
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-tangerine rounded-none"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
            </Link>
        );

        if (collapsed) {
            return (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                        {item.title}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return content;
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-none bg-gradient-to-br from-tangerine to-tangerine/80 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">O</span>
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-semibold text-xl text-foreground whitespace-nowrap overflow-hidden"
                            >
                                Ori-OS
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
                {/* Mobile close button */}
                <button
                    className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
                    onClick={onMobileClose}
                >
                    <X className="h-5 w-5" />
                </button>
                {/* Desktop collapse button */}
                <button
                    className="hidden lg:flex p-1 text-muted-foreground hover:text-foreground"
                    onClick={onCollapse}
                >
                    <ChevronLeft
                        className={cn(
                            'h-5 w-5 transition-transform duration-300',
                            collapsed && 'rotate-180'
                        )}
                    />
                </button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="px-2 space-y-1">
                    {mainNavItems.map((item) => (
                        <NavItem
                            key={item.href}
                            item={item}
                            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                        />
                    ))}
                </nav>
            </ScrollArea>

            {/* Bottom section */}
            <div className="border-t border-border py-4 px-2 space-y-1">
                {bottomNavItems.map((item) => (
                    <NavItem
                        key={item.href}
                        item={item}
                        isActive={pathname === item.href}
                    />
                ))}
            </div>

            {/* Profile section */}
            <div className="mt-auto border-t border-border p-2">
                <UserAccount collapsed={collapsed} />
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-30 hidden lg:block h-screen bg-background border-r border-border transition-all duration-300',
                    collapsed ? 'w-16' : 'w-64'
                )}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed left-0 top-0 z-50 lg:hidden h-screen w-64 bg-background border-r border-border"
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
