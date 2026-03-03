'use client';

import { useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ori-os/ui';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
                <CardHeader>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <CardTitle>Module Error</CardTitle>
                    </div>
                    <CardDescription>
                        An unexpected error occurred in this dashboard view.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground break-all">
                        {error.message || 'Something went wrong while rendering the UI.'}
                    </p>
                    <div className="flex gap-4">
                        <Button variant="destructive" onClick={() => reset()}>
                            Try again
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                            Return to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
