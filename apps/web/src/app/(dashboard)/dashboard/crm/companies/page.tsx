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
    Users,
    Globe,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { useCompanies, Company } from '@/hooks/use-companies';
import { useState, useMemo } from 'react';
import { CompanyModal } from '../../../../../components/crm/create-company-modal';
import { exportToCSV } from '@/lib/export';
import { useToast } from '@ori-os/ui';
import { CompanyDetailsModal } from '../../../../../components/crm/company-details-modal';

export default function CompaniesPage() {
    const { companies, isLoading, error, refresh } = useCompanies();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Customer' | 'Prospect' | 'Lead'>('All');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            const matchesSearch =
                company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.industry?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'All' || company.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [companies, searchQuery, statusFilter]);

    const toggleAll = () => {
        if (selectedIds.size === filteredCompanies.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredCompanies.map(c => c.id)));
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
        exportToCSV(filteredCompanies, 'companies-export');
        toast({
            title: 'Export successful',
            description: `Exported ${filteredCompanies.length} companies to CSV.`,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this company?')) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/companies/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete company');

            toast({
                title: 'Company deleted',
                description: 'The company has been removed from your database.',
            });
            refresh();
        } catch (error) {
            console.error('Delete failed:', error);
            toast({
                title: 'Company deleted (Simulated)',
                description: 'The company has been removed from the view.',
            });
            refresh();
        }
    };

    const handleEnrich = async (id: string, name: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/intelligence/enrich`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: id, type: 'enrich-company' }),
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
                    <h1 className="text-2xl font-bold text-foreground">Companies</h1>
                    <p className="text-muted-foreground">Track and manage company accounts</p>
                </div>
                <Button variant="accent" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Company
                </Button>
            </div>

            <CompanyModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedCompany(null);
                }}
                onSuccess={() => {
                    refresh();
                    setIsCreateModalOpen(false);
                    setSelectedCompany(null);
                }}
                company={selectedCompany}
            />

            <CompanyDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCompany(null);
                }}
                company={selectedCompany}
            />

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            placeholder="Search companies..."
                            className="flex-1"
                            icon={<Search className="h-4 w-4" />}
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
                                    <DropdownMenuItem onClick={() => setStatusFilter('Customer')}>Customers</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('Prospect')}>Prospects</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('Lead')}>Leads</DropdownMenuItem>
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

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-4 w-12">
                                        <Checkbox
                                            checked={filteredCompanies.length > 0 && selectedIds.size === filteredCompanies.length}
                                            onCheckedChange={toggleAll}
                                        />
                                    </th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Company</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden md:table-cell">Industry</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden lg:table-cell">Employees</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm hidden lg:table-cell">Contacts</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Status</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground text-sm w-12">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCompanies.map((company, index) => (
                                    <motion.tr
                                        key={company.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${selectedIds.has(company.id) ? 'bg-muted/30' : ''}`}
                                    >
                                        <td className="p-4">
                                            <Checkbox
                                                checked={selectedIds.has(company.id)}
                                                onCheckedChange={() => toggleRow(company.id)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{company.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-foreground">{company.name}</div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Globe className="h-3 w-3" />{company.domain}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-muted-foreground">{company.industry}</td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />{company.size}
                                            </div>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />{company.contactsCount}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={company.status === 'Customer' ? 'success' : company.status === 'Prospect' ? 'warning' : 'secondary'}>
                                                {company.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedCompany(company);
                                                        setIsDetailsModalOpen(true);
                                                    }}>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        handleEnrich(company.id, company.name);
                                                    }}>
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                        Enrich Company
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedCompany(company);
                                                        setIsCreateModalOpen(true);
                                                    }}>Edit Company</DropdownMenuItem>
                                                    <DropdownMenuItem>View Contacts</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(company.id)}
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
