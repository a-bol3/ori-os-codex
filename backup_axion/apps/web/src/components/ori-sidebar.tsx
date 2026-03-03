'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Search,
  Target,
  Users,
  Workflow,
  Mail,
  Shield,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Plus,
  User,
  Building2,
  LogOut,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useGlobalSearch } from '@/hooks/use-search'

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Command Center',
    icon: LayoutDashboard,
    shortcut: 'MOD_D',
    href: '/dashboard',
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: Target,
    shortcut: 'MOD_I',
    href: '/dashboard/intelligence',
  },
  {
    id: 'crm',
    label: 'Relationship Hub',
    icon: Users,
    shortcut: 'MOD_R',
    href: '/dashboard/crm',
  },
  {
    id: 'automation',
    label: 'Automation Studio',
    icon: Workflow,
    shortcut: 'MOD_A',
    href: '/dashboard/automation',
  },
  {
    id: 'engagement',
    label: 'Engagement Suite',
    icon: Mail,
    shortcut: 'MOD_E',
    href: '/dashboard/engagement',
  },
  {
    id: 'seo',
    label: 'SEO Studio',
    icon: Search,
    shortcut: 'MOD_S',
    href: '/dashboard/seo',
    hidden: process.env.NEXT_PUBLIC_ENABLE_SEO_STUDIO !== 'true',
  },
  {
    id: 'compliance',
    label: 'Security Protocol',
    icon: Shield,
    shortcut: 'MOD_C',
    href: '/dashboard/compliance',
  },
  {
    id: 'tasks',
    label: 'Knowledge Hub',
    icon: FileText,
    shortcut: 'MOD_K',
    href: '/dashboard/knowledge',
  },
].filter(item => !item.hidden)

export function OriSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const pathname = usePathname()
  const { openSearch } = useGlobalSearch()

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault()
    openSearch()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-500 bg-black border-r border-white/10',
          sidebarCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Header Segment */}
        <div className="flex h-16 items-center border-b border-white/10">
          {!sidebarCollapsed && (
            <div className="flex-1 flex items-center px-6 gap-3">
              <Zap className="h-5 w-5 text-axion-orange fill-current" />
              <span className="text-xl font-black tracking-[-0.05em] text-white">ORI-OS</span>
              <div className="ml-auto px-2 py-0.5 border border-axion-green/30 bg-axion-green/5 text-[8px] font-mono text-axion-green uppercase tracking-widest">
                CORE_V2
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={cn(
              'h-full px-4 text-white/20 hover:text-white hover:bg-white/5 border-l border-white/10 transition-all',
              sidebarCollapsed && 'flex-1 border-l-0'
            )}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* System ID / Context */}
        {!sidebarCollapsed && (
          <div className="px-6 py-4 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-2 text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-1">
              <Terminal size={10} />
              System_Identity
            </div>
            <div className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
              INST: <span className="text-axion-orange">ORI_CORE_ACTIVE</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex w-full items-center gap-4 px-6 py-3.5 text-[10px] font-mono font-bold transition-all uppercase tracking-[0.15em] transition-all group',
                      isActive
                        ? 'bg-axion-orange/10 text-white border-r-2 border-axion-orange'
                        : 'text-white/40 hover:bg-white/5 hover:text-white',
                      sidebarCollapsed && 'justify-center px-0'
                    )}
                  >
                    <item.icon className={cn(
                      'h-4 w-4 shrink-0 transition-all duration-300',
                      isActive ? 'text-axion-orange scale-110' : 'group-hover:text-axion-orange'
                    )} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-white/20 font-mono border border-white/10 px-1 py-0.5">
                          {item.shortcut}
                        </span>
                      </>
                    )}
                  </Link>
                </TooltipTrigger>
                {sidebarCollapsed && <TooltipContent side="right" className="bg-black border-white/10 font-mono text-[10px] uppercase tracking-widest">{item.label}</TooltipContent>}
              </Tooltip>
            )
          })}
        </nav>

        {/* Footer Area */}
        <div className="mt-auto border-t border-white/10 p-4 space-y-2">
          {!sidebarCollapsed && (
            <button
              onClick={handleSearchClick}
              className="flex w-full items-center gap-4 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white transition-all border border-white/5 group"
            >
              <Search className="h-4 w-4 group-hover:text-axion-orange transition-colors" />
              <span>Search_Database</span>
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-4 p-3 hover:bg-white/5 transition-all border border-white/10 bg-white/[0.02] group relative overflow-hidden",
                  sidebarCollapsed && "justify-center p-2"
                )}
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-axion-orange/30" />
                <Avatar className="h-8 w-8 rounded-none border border-white/10">
                  <AvatarFallback className="bg-axion-orange text-black font-black rounded-none text-[9px]">JD</AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">OFFICER_DOE</p>
                    <p className="text-[8px] text-white/30 font-mono uppercase tracking-widest truncate">Access_Level: Root</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-64 bg-black border-white/10 rounded-none p-1 font-mono">
              <div className="px-3 py-2 text-[9px] text-white/20 uppercase tracking-[0.2em] border-b border-white/5 mb-1">Authorization_Menu</div>
              <Link href="/">
                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-white hover:bg-axion-orange hover:text-black py-2.5 rounded-none cursor-pointer">
                  <Zap className="mr-3 h-4 w-4 fill-current" />
                  Terminal Home
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-white/10" />
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/5 py-2.5 rounded-none cursor-pointer">
                  <User className="mr-3 h-4 w-4" />
                  Profile_Data
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/5 py-2.5 rounded-none cursor-pointer">
                  <Building2 className="mr-3 h-4 w-4" />
                  Org_Cluster
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 py-2.5 rounded-none cursor-pointer">
                <LogOut className="mr-3 h-4 w-4" />
                Terminate_Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  )
}
