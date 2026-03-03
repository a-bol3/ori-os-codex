'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Button,
    Input,
    Avatar,
    AvatarFallback,
    AvatarImage,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Badge,
} from '@ori-os/ui';
import {
    Menu,
    Search,
    Bell,
    Settings,
    User,
    LogOut,
    Moon,
    Sun,
    HelpCircle,
    ChevronDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { useActivity } from '@/hooks/use-activity';

interface HeaderProps {
    onMobileMenuClick: () => void;
    sidebarCollapsed: boolean;
}

export function Header({ onMobileMenuClick, sidebarCollapsed }: HeaderProps) {
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const { activities, markAsRead } = useActivity();

    const unreadCount = useMemo(() => activities.filter(a => a.status === 'unread').length, [activities]);

    const user = session?.user || { name: 'John Doe', email: 'john@company.com' };
    const initials = user.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'JD';

    return (
        <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
                        onClick={onMobileMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="hidden sm:block relative">
                        <Input
                            placeholder="Search contacts, companies, deals..."
                            className="w-64 lg:w-80 pl-10"
                            icon={<Search className="h-4 w-4" />}
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground bg-muted rounded-none">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="relative">
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-tangerine text-white text-2xs font-medium rounded-none flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel className="flex items-center justify-between">
                                Notifications
                                {unreadCount > 0 && <Badge variant="secondary" className="text-2xs">{unreadCount} new</Badge>}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-64 overflow-y-auto">
                                {activities.map((activity) => (
                                    <DropdownMenuItem
                                        key={activity.id}
                                        className="flex flex-col items-start p-3 cursor-pointer"
                                        onClick={() => activity.status === 'unread' && markAsRead(activity.id)}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="font-medium text-sm flex-1">{activity.title}</div>
                                            {activity.status === 'unread' && <div className="h-2 w-2 rounded-none bg-tangerine" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                            {activity.description}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {activity.time}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                {activities.length === 0 && (
                                    <div className="p-4 text-center text-muted-foreground text-sm italic">No notifications</div>
                                )}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center text-tangerine font-medium">
                                View all activity
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2 px-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block text-left text-sm font-medium">{user.name}</div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div>{user.name}</div>
                                <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href="/dashboard/settings/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => signOut({ callbackUrl: "/" })}>
                                <LogOut className="mr-2 h-4 w-4" />Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
