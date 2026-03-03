'use client';

import { useParams } from 'next/navigation';
import { AlertsList } from '@/components/seo/alerts-list';

export default function ProjectAlertsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage notifications and alerts for this project.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <AlertsList projectId={projectId} />
            </div>
        </div>
    );
}
