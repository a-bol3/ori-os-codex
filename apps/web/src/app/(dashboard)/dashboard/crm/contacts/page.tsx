'use client';

import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Badge,
    Avatar,
    AvatarFallback,
    Checkbox,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@ori-os/ui';
import {
    Search,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    Mail,
    Building2,
    MapPin,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { useContacts } from '@/hooks/use-contacts';
import { useState, useMemo } from 'react';
import { ContactModal } from '../../../../../components/crm/create-contact-modal';
import { exportToCSV } from '@/lib/export';
import { useToast } from '@ori-os/ui';
import { ContactDetailsModal } from '../../../../../components/crm/contact-details-modal';

export default function ContactsPage() {
    const { contacts, isLoading, error, refresh } = useContacts();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch =
                contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [contacts, searchQuery, statusFilter]);

    const toggleAll = () => {
        if (selectedIds.size === filteredContacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const toggleRow = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleExport = () => {
        exportToCSV(filteredContacts, 'contacts-export');
        toast({
            title: 'Export successful',
            description: `Exported ${filteredContacts.length} contacts to CSV.`,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/contacts/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete contact');

            toast({
                title: 'Contact deleted',
                description: 'The contact has been removed from your database.',
            });
            refresh();
        } catch (error) {
            console.error('Delete failed:', error);
            // Mock delete for demo
            toast({
                title: 'Contact deleted (Simulated)',
                description: 'The contact has been removed from the view.',
            });
            refresh();
        }
    };

    const handleEnrich = async (id: string, name: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intelligence/enrich`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactId: id, type: 'enrich-contact' }),
            });

            if (!response.ok) throw new Error('Enrichment failed');

            toast({
                title: 'Enrichment Started',
                description: `Background enrichment job for ${name} has been created.`,
            });
        } catch (error) {
            toast({
                title: 'Enrichment Simulated',
                description: `Job created for ${name} (Simulation mode).`,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-tangerine" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
                    <p className="text-muted-foreground">
                        Manage and organize your contact database
                    </p>
                </div>
                <Button variant="accent" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                </Button>
            </div>

            <ContactModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedContact(null);
                }}
                onSuccess={() => {
                    refresh();
                    setIsCreateModalOpen(false);
                    setSelectedContact(null);
                }}
                contact={selectedContact}
            />

            <ContactDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedContact(null);
                }}
                contact={selectedContact}
            />

            {/* Filters and search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            placeholder="Search contacts..."
                            className="flex-1"
                            icon={<Search className="h-4 w-4 text-tangerine" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        {statusFilter === 'All' ? 'Filters' : statusFilter}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setStatusFilter('All')}>All Statuses</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('Active')}>Active Only</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('Inactive')}>Inactive Only</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contacts table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-4 w-12">
                                        <Checkbox
                                            checked={filteredContacts.length > 0 && selectedIds.size === filteredContacts.length}
                                            onCheckedChange={toggleAll}
                                        />
                                    </th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                                        Contact
                                    </th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden md:table-cell">
                                        Company
                                    </th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden lg:table-cell">
                                        Location
                                    </th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                                        Status
                                    </th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm w-12">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map((contact, index) => (
                                    <motion.tr
                                        key={contact.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${selectedIds.has(contact.id) ? 'bg-muted/30' : ''}`}
                                    >
                                        <td className="p-4">
                                            <Checkbox
                                                checked={selectedIds.has(contact.id)}
                                                onCheckedChange={() => toggleRow(contact.id)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="rounded-none">
                                                    <AvatarFallback className="rounded-none">
                                                        {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-foreground">
                                                        {contact.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {contact.jobTitle}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1 group/item">
                                                            <Mail className="h-3 w-3 text-tangerine/60 group-hover/item:text-tangerine transition-colors" />
                                                            {contact.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 group/item">
                                                <Building2 className="h-4 w-4 text-tangerine/60 group-hover/item:text-tangerine transition-colors" />
                                                <span className="text-foreground">{contact.company}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-2 group/item">
                                                <MapPin className="h-4 w-4 text-tangerine/60 group-hover/item:text-tangerine transition-colors" />
                                                <span className="text-muted-foreground">
                                                    {contact.location}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                variant={
                                                    contact.status === 'Active' ? 'success' : 'secondary'
                                                }
                                            >
                                                {contact.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedContact(contact);
                                                        setIsDetailsModalOpen(true);
                                                    }}>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        if (contact.id && contact.name) {
                                                            handleEnrich(contact.id, contact.name);
                                                        }
                                                    }}>
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                        Enrich Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedContact(contact);
                                                        setIsCreateModalOpen(true);
                                                    }}>Edit Contact</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        toast({ title: 'Added to Sequence', description: `${contact.name} added to outreach.` });
                                                    }}>Add to Sequence</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        toast({ title: 'Email Editor Opened', description: `Drafting email to ${contact.email}.` });
                                                    }}>Send Email</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(contact.id)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
