'use client';

export default function DashboardLoading() {
    return (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center p-4">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-tangerine" />
                <p className="text-muted-foreground text-sm font-medium">Loading module...</p>
            </div>
        </div>
    );
}
