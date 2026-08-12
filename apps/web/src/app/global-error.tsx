"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
                <div className="max-w-md text-center space-y-4">
                    <h1 className="text-3xl font-bold">Something went wrong</h1>
                    <p className="text-muted-foreground">
                        We hit an unexpected application error. You can try again now.
                    </p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
