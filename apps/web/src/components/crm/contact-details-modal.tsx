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
import { Mail, Phone, Building2, MapPin, Calendar } from 'lucide-react';

interface ContactDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: any;
}

export function ContactDetailsModal({ isOpen, onClose, contact }: ContactDetailsModalProps) {
    if (!contact) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Contact Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-xl">
                                {contact.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{contact.name}</h2>
                            <p className="text-muted-foreground">{contact.jobTitle}</p>
                            <Badge className="mt-2" variant={contact.status === 'Active' ? 'success' : 'secondary'}>
                                {contact.status || 'Active'}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {contact.email}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Phone</Label>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {contact.phone || 'Not provided'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Company</Label>
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {contact.company || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Location</Label>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {contact.location || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Added on {new Date(contact.createdAt || Date.now()).toLocaleDateString()}
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
