import type { Metadata } from 'next';
import '../styles/globals.css';
import { cn, Toaster } from '@ori-os/ui';
import { SessionProvider } from 'next-auth/react';
import { Providers } from '@/components/providers';
import { auth } from '@/auth';

export const metadata: Metadata = {
    title: {
        default: 'Ori-OS | The Unified Operating System for GTM Teams',
        template: '%s | Ori-OS',
    },
    description: 'Consolidate your sales stack into a single, AI-powered platform.',
    keywords: [
        'sales intelligence',
        'lead enrichment',
        'workflow automation',
        'CRM',
        'analytics',
        'outreach',
        'AI-powered',
    ],
    authors: [{ name: 'Ori-OS' }],
};

import { CookieConsent } from '@/components/layout/cookie-consent';

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn('min-h-screen bg-background font-sans antialiased')}>
                <SessionProvider session={session}>
                    <Providers>
                        {children}
                        <CookieConsent />
                        <Toaster />
                    </Providers>
                </SessionProvider>
            </body>
        </html>
    );
}
