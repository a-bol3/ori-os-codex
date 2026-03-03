'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Badge,
    Avatar,
    AvatarFallback,
} from '@ori-os/ui';
import { Globe, Users, Building2, MapPin, Calendar, Info } from 'lucide-react';

interface CompanyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: any;
}

export function CompanyDetailsModal({ isOpen, onClose, company }: CompanyDetailsModalProps) {
    if (!company) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Company Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-none">
                            <AvatarFallback className="text-xl rounded-none">
                                {company.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="hover:text-tangerine transition-colors">
                                    {company.domain}
                                </a>
                            </div>
                            <Badge className="mt-2" variant={company.status === 'Customer' ? 'success' : company.status === 'Prospect' ? 'warning' : 'secondary'}>
                                {company.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Industry</Label>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {company.industry || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Company Size</Label>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {company.size || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Location</Label>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {company.location || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Total Contacts</Label>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {company.contactsCount || 0}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label className="text-xs text-muted-foreground uppercase">Description</Label>
                        <div className="flex gap-2 p-3 rounded-none bg-muted/50 text-sm text-foreground italic border-l-2 border-tangerine">
                            <Info className="h-4 w-4 text-tangerine shrink-0 mt-0.5" />
                            {company.description || 'No description available.'}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Added on {new Date(company.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`block font-medium ${className}`}>{children}</span>;
}
