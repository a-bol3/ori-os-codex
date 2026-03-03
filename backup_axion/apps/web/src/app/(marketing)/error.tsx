'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col min-h-screen">
            <MarketingHeader />
            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center py-20">
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                    Opps! An error occurred.
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
                    We're sorry for the inconvenience. The page you're trying to reach is currently unavailable.
                </p>
                <div className="flex gap-4">
                    <Button size="lg" variant="outline" onClick={() => window.location.href = '/'}>
                        Back to Home
                    </Button>
                    <Button size="lg" onClick={() => reset()}>
                        Try Again
                    </Button>
                </div>
            </main>
            <MarketingFooter />
        </div>
    )
}
