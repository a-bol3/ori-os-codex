import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import '../styles/globals.css';
import { cn, Toaster } from '@ori-os/ui';
import { SessionProvider } from 'next-auth/react';
import { Providers } from '@/components/providers';

const urbanist = Urbanist({
    subsets: ['latin'],
    variable: '--font-urbanist',
    display: 'swap',
});

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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn('min-h-screen bg-background font-sans antialiased', urbanist.variable)}>
                <SessionProvider>
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
