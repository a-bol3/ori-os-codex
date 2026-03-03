
'use client';

import React from 'react';
import { CampaignWizard } from '@/components/engagement/CampaignWizard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@ori-os/ui';

export default function NewCampaignPage() {
    return (
        <div className="container py-8 space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/engagement">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campaign Builder</h1>
                    <p className="text-muted-foreground">Design your multi-step outreach flow.</p>
                </div>
            </div>

            <CampaignWizard />
        </div>
    );
}
