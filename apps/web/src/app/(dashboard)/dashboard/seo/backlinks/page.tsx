'use client';

import Link from 'next/link';
import { ArrowRight, Globe, Link2, Loader2, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@ori-os/ui';
import { useSEOProjects } from '@/hooks/use-seo-projects';

export default function BacklinksPage() {
    const { projects, isLoading, error } = useSEOProjects();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Backlinks</h1>
                    <p className="text-muted-foreground">
                        Select an SEO project to monitor its backlink profile.
                    </p>
                </div>
                <Button asChild variant="accent">
                    <Link href="/dashboard/seo/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New SEO project
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>SEO projects</CardTitle>
                    <CardDescription>
                        Backlinks are tracked within a project so every record stays linked to its domain.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-destructive">
                            <AlertCircle className="h-10 w-10" />
                            <p className="font-medium">Unable to load SEO projects.</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                            <Link2 className="h-12 w-12 opacity-30" />
                            <p className="text-lg font-medium text-foreground">No SEO projects yet</p>
                            <p className="text-sm">Create a project before adding backlinks.</p>
                            <Button asChild>
                                <Link href="/dashboard/seo/projects/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create SEO project
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {projects.map((project) => (
                                <Card key={project.id} className="border-border/70">
                                    <CardContent className="flex items-center justify-between gap-4 p-5">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 shrink-0 text-primary" />
                                                <h2 className="truncate font-semibold text-foreground">{project.name}</h2>
                                            </div>
                                            <p className="mt-1 truncate text-sm text-muted-foreground">{project.domain}</p>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/dashboard/seo/projects/${project.id}/backlinks`}>
                                                Open
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
