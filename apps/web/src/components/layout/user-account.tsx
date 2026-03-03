'use client';

import { useSession } from 'next-auth/react';
import { logoutAction } from '@/lib/actions/auth';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Button,
} from '@ori-os/ui';
import { LogOut, User, Settings, CreditCard, Sparkles } from 'lucide-react';

interface UserAccountProps {
    collapsed: boolean;
}

export function UserAccount({ collapsed }: UserAccountProps) {
    const { data: session } = useSession();
    const user = session?.user;

    if (!user) return null;

    const initials = user.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
        : user.email?.[0].toUpperCase() || 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={collapsed ? 'h-9 w-9 p-0' : 'w-full justify-start px-2 py-6'}
                >
                    <Avatar className="h-8 w-8 shrink-0 rounded-none">
                        <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                        <AvatarFallback className="bg-tangerine/10 text-tangerine text-xs rounded-none">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <div className="ml-3 flex flex-col items-start overflow-hidden">
                            <span className="text-sm font-medium text-foreground truncate w-full text-left">
                                {user.name || 'User'}
                            </span>
                            <span className="text-xs text-muted-foreground truncate w-full text-left">
                                {user.email}
                            </span>
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side={collapsed ? 'right' : 'top'}>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                    My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-tangerine focus:text-tangerine">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Upgrade to Pro</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => logoutAction()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
