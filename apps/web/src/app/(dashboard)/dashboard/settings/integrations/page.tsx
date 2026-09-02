'use client';

import { motion } from 'framer-motion';
import { Plus, Zap, Globe, BarChart3, Mail, Database, Slack, type LucideIcon } from 'lucide-react';
import {
    Card,
    CardContent,
    Button,
    Badge,
    useToast,
} from '@ori-os/ui';
import { useEffect, useState } from 'react';
import { apiFetch, getErrorMessage } from '@/lib/api-client';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: string;
    connected: boolean;
    comingSoon?: boolean;
}

const INTEGRATIONS: Integration[] = [
    { id: 'google-analytics', name: 'Google Analytics', description: 'Track website traffic and user behavior', icon: BarChart3, category: 'Analytics', connected: false, comingSoon: true },
    { id: 'google-search-console', name: 'Google Search Console', description: 'Monitor search performance and indexing', icon: Globe, category: 'SEO', connected: false, comingSoon: true },
    { id: 'slack', name: 'Slack', description: 'Get real-time notifications in your Slack workspace', icon: Slack, category: 'Communication', connected: false, comingSoon: true },
    { id: 'gmail', name: 'Gmail', description: 'Read email metadata for controlled operational signals', icon: Mail, category: 'Email', connected: false },
    { id: 'mailchimp', name: 'Mailchimp', description: 'Sync contacts and campaigns with Mailchimp', icon: Mail, category: 'Email', connected: false, comingSoon: true },
    { id: 'hubspot', name: 'HubSpot', description: 'Bi-directional CRM sync with HubSpot', icon: Database, category: 'CRM', connected: false, comingSoon: true },
    { id: 'zapier', name: 'Zapier', description: 'Connect Ori-OS to 5000+ apps via Zapier', icon: Zap, category: 'Automation', connected: false, comingSoon: true },
];

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState(INTEGRATIONS);
    const [statusError, setStatusError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        let active = true;
        apiFetch('/integrations/gmail/status')
            .then(async (response) => response.json())
            .then((status) => {
                if (!active) return;
                setIntegrations(prev => prev.map(i => i.id === 'gmail'
                    ? { ...i, connected: status.integration?.status === 'active' }
                    : i));
            })
            .catch((err) => {
                if (active) setStatusError(getErrorMessage(err, 'Unable to load Gmail connection status.'));
            });
        return () => { active = false; };
    }, []);

    const toggleConnection = async (id: string) => {
        const integration = integrations.find(i => i.id === id);
        if (!integration || integration.comingSoon) return;

        if (id === 'gmail' && !integration.connected) {
            try {
                const response = await apiFetch('/integrations/gmail/connect');
                const result = await response.json() as { authUrl?: string };
                if (!result.authUrl) throw new Error('Could not start Gmail authorization');
                window.location.assign(result.authUrl);
            } catch {
                toast({ title: 'Unable to connect Gmail', description: 'Please try again or contact an administrator.' });
            }
            return;
        }

        toast({ title: 'Integration unavailable', description: `${integration.name} is not yet available.` });
    };

    const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
                <p className="text-muted-foreground">Connect Ori-OS with your favorite tools and services</p>
            </div>

            {statusError && <div role="alert" className="border border-destructive/40 p-4 text-sm text-destructive">{statusError}</div>}

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
