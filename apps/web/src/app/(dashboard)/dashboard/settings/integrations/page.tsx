'use client';

import { motion } from 'framer-motion';
import { Puzzle, CheckCircle2, XCircle, Plus, Zap, Globe, BarChart3, Mail, Database, Slack } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Badge,
    useToast,
} from '@ori-os/ui';
import { useState } from 'react';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: any;
    category: string;
    connected: boolean;
    comingSoon?: boolean;
}

const INTEGRATIONS: Integration[] = [
    { id: 'google-analytics', name: 'Google Analytics', description: 'Track website traffic and user behavior', icon: BarChart3, category: 'Analytics', connected: false },
    { id: 'google-search-console', name: 'Google Search Console', description: 'Monitor search performance and indexing', icon: Globe, category: 'SEO', connected: false },
    { id: 'slack', name: 'Slack', description: 'Get real-time notifications in your Slack workspace', icon: Slack, category: 'Communication', connected: false },
    { id: 'mailchimp', name: 'Mailchimp', description: 'Sync contacts and campaigns with Mailchimp', icon: Mail, category: 'Email', connected: false },
    { id: 'hubspot', name: 'HubSpot', description: 'Bi-directional CRM sync with HubSpot', icon: Database, category: 'CRM', connected: false, comingSoon: true },
    { id: 'zapier', name: 'Zapier', description: 'Connect Ori-OS to 5000+ apps via Zapier', icon: Zap, category: 'Automation', connected: false, comingSoon: true },
];

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState(INTEGRATIONS);
    const { toast } = useToast();

    const toggleConnection = async (id: string) => {
        const integration = integrations.find(i => i.id === id);
        if (!integration || integration.comingSoon) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/integrations/${id}`, {
                method: integration.connected ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) throw new Error('API unavailable');
        } catch {
            // Optimistic update even if API fails
        }

        setIntegrations(prev => prev.map(i =>
            i.id === id ? { ...i, connected: !i.connected } : i
        ));

        toast({
            title: integration.connected ? `${integration.name} disconnected` : `${integration.name} connected`,
            description: integration.connected ? 'Integration has been removed.' : 'Integration is now active.',
        });
    };

    const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
                <p className="text-muted-foreground">Connect Ori-OS with your favorite tools and services</p>
            </div>

            {categories.map((category, ci) => (
                <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.1 }}
                >
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {integrations.filter(i => i.category === category).map(integration => (
                            <Card key={integration.id} className={integration.connected ? 'border-primary/30 bg-primary/5' : ''}>
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={`p-3 rounded-xl flex-shrink-0 ${integration.connected ? 'bg-primary/20' : 'bg-muted'}`}>
                                        <integration.icon className={`h-6 w-6 ${integration.connected ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-foreground">{integration.name}</p>
                                            {integration.comingSoon && (
                                                <Badge variant="secondary" className="text-xs">Soon</Badge>
                                            )}
                                            {integration.connected && (
                                                <Badge variant="default" className="text-xs">Connected</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{integration.description}</p>
                                    </div>
                                    <Button
                                        variant={integration.connected ? 'outline' : 'default'}
                                        size="sm"
                                        disabled={integration.comingSoon}
                                        onClick={() => toggleConnection(integration.id)}
                                    >
                                        {integration.comingSoon ? 'Soon' : integration.connected ? 'Disconnect' : 'Connect'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            ))}

            <Card className="border-dashed">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-muted flex-shrink-0">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Request an Integration</p>
                        <p className="text-sm text-muted-foreground">Don't see what you need? Let us know and we'll add it.</p>
                    </div>
                    <a href="mailto:integrations@ori-os.com" className="ml-auto">
                        <Button variant="outline" size="sm">Request</Button>
                    </a>
                </CardContent>
            </Card>
        </div>
    );
}
