'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                We encountered an unexpected error in the dashboard. Our team has been notified.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go Home
                </Button>
                <Button onClick={() => reset()}>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try again
                </Button>
            </div>
        </div>
    )
}
