'use client'

import { SEOStudioView } from '@/components/seo-studio-view'

export default function SEOPage() {
    if (process.env.NEXT_PUBLIC_ENABLE_SEO_STUDIO !== 'true') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h1 className="text-3xl font-bold">SEO Studio</h1>
                <p className="text-muted-foreground">This module is currently in maintenance. Please check back later.</p>
            </div>
        )
    }
    return <SEOStudioView />
}
