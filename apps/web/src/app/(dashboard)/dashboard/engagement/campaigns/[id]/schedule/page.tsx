import { use } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ori-os/ui';
import { ChevronLeft, Calendar, Save } from 'lucide-react';
import Link from 'next/link';

export default function CampaignSchedulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="container max-w-2xl py-10 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/engagement/campaigns/${id}`}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Schedule Campaign</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery Settings</CardTitle>
                    <CardDescription>Configure when your emails should be sent.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-8 border-2 border-dashed rounded-none text-center opacity-50">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">Scheduler Coming Soon</p>
                        <p className="text-sm text-muted-foreground">Detailed timezone and sending window controls are being implemented.</p>
                    </div>
                    <Button className="w-full">
                        <Save className="mr-2 h-4 w-4" /> Save Schedule
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
