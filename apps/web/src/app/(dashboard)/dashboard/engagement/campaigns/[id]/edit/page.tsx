import { use } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ori-os/ui';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CampaignEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="container max-w-4xl py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/engagement/campaigns/${id}`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Campaign</h1>
                </div>
                <Button>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sequence Editor</CardTitle>
                    <CardDescription>Modify your campaign steps and content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-20 border-2 border-dashed rounded-none text-center opacity-50">
                        <p className="text-lg font-medium">Advanced Editor Coming Soon</p>
                        <p className="text-sm text-muted-foreground">The drag-and-drop sequence builder is being integrated.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
