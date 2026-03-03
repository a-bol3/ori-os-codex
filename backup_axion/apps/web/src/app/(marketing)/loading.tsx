import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="h-20 border-b border-border/40 px-6 flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <div className="hidden md:flex gap-8">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-28 rounded-full" />
            </div>

            <main className="flex-1 py-20 px-6 container mx-auto space-y-20">
                <div className="space-y-6 text-center max-w-3xl mx-auto">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
                    <div className="flex justify-center gap-4 pt-6">
                        <Skeleton className="h-12 w-40 rounded-full" />
                        <Skeleton className="h-12 w-40 rounded-full" />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 pt-10">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-3xl" />
                    ))}
                </div>
            </main>
        </div>
    )
}
