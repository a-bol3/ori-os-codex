'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Input,
    Label,
    useToast,
} from '@ori-os/ui';
import { ChevronLeft, Globe, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewSEOProjectPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast({
                title: "Project Created",
                description: `${formData.name} has been added to your SEO Studio.`,
            });

            router.push('/dashboard/seo');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create project. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link href="/dashboard/seo" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                    <ChevronLeft className="w-4 h-4" />
                    Back to SEO Studio
                </Link>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                    New SEO Project
                </h1>
                <p className="text-muted-foreground">
                    Add a new website to monitor its search performance and health
                </p>
            </motion.div>

            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Enter the basic information for your new website project</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. My Awesome Startup"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain URL</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="domain"
                                    className="pl-10"
                                    placeholder="example.com"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">We'll use this to crawl your site and track keyword positions</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="accent"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Project
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
