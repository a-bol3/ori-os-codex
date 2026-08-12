'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@ori-os/ui';

export function AppShell({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen overflow-x-hidden bg-background">
            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            {/* Main content area */}
            <div
                className={cn(
                    'flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300',
                    sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                )}
            >
                <Header
                    onMobileMenuClick={() => setMobileSidebarOpen(true)}
                    sidebarCollapsed={sidebarCollapsed}
                />
                <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-visible p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
