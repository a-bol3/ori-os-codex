import type { ActivityType } from '@prisma/client';

export type ReferenceScenario = {
    key: string;
    company: {
        id: string;
        name: string;
        website?: string;
        domain?: string;
        industry?: string;
        sizeBand?: string;
        country?: string;
        city?: string;
        linkedinUrl?: string;
    };
    contacts: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        jobTitle?: string;
        country?: string;
        emailStatus?: 'VALID' | 'INVALID' | 'CATCH_ALL' | 'DISPOSABLE' | 'UNKNOWN';
    }>;
    deal: {
        id: string;
        name: string;
        valueAmount: number;
        valueCurrency: string;
        stageName: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won';
        status?: 'open' | 'won' | 'lost';
        primaryContactEmail: string;
        closeDateOffsetDays: number;
    };
    tasks: Array<{
        id: string;
        title: string;
        description?: string;
        status: 'pending' | 'completed';
        dueDateOffsetDays?: number;
        contactEmail?: string;
    }>;
    activities: Array<{
        id: string;
        type: ActivityType;
        subject: string;
        body?: string;
        contactEmail?: string;
    }>;
    auditLogs: Array<{
        id: string;
        action: string;
        entityType: 'company' | 'contact' | 'deal' | 'task' | 'activity';
        target: 'company' | 'deal' | { contactEmail: string };
        metadataJson?: Record<string, unknown>;
    }>;
};

export const referenceScenarios: ReferenceScenario[] = [
    {
        key: 'folga_recruitment_expansion',
        company: {
            id: 'ref-company-folga',
            name: 'FOLGA SP. Z O.O.',
            website: 'https://folga.com.pl',
            domain: 'folga.com.pl',
            industry: 'HR',
            sizeBand: '100-150',
            country: 'Poland',
            city: 'Torun',
        },
        contacts: [
            {
                id: 'ref-contact-folga-anna',
                firstName: 'Anna',
                lastName: 'Kowalska',
                email: 'anna.kowalska@folga.com.pl',
                jobTitle: 'HR Manager',
                country: 'Poland',
                emailStatus: 'VALID',
            },
            {
                id: 'ref-contact-folga-marek',
                firstName: 'Marek',
                lastName: 'Zielinski',
                email: 'marek.zielinski@folga.com.pl',
                jobTitle: 'Operations Director',
                country: 'Poland',
                emailStatus: 'VALID',
            },
        ],
        deal: {
            id: 'ref-deal-folga-rollout',
            name: 'Folga Expansion Rollout',
            valueAmount: 18000,
            valueCurrency: 'USD',
            stageName: 'Qualified',
            status: 'open',
            primaryContactEmail: 'anna.kowalska@folga.com.pl',
            closeDateOffsetDays: 21,
        },
        tasks: [
            {
                id: 'ref-task-folga-scope',
                title: 'Confirm rollout scope for Torun recruitment team',
                description: 'Validate which recruiter workflows, fields, and ownership rules must be ready for the first rollout.',
                status: 'pending',
                dueDateOffsetDays: 2,
                contactEmail: 'anna.kowalska@folga.com.pl',
            },
            {
                id: 'ref-task-folga-migration',
                title: 'Review CRM migration checklist',
                description: 'Ensure legacy spreadsheet contacts and follow-up routines are mapped into the CRM before onboarding.',
                status: 'completed',
                dueDateOffsetDays: -1,
                contactEmail: 'marek.zielinski@folga.com.pl',
            },
            {
                id: 'ref-task-folga-proposal',
                title: 'Schedule proposal walkthrough with Anna Kowalska',
                description: 'Prepare the next qualification meeting and align the CRM rollout with August hiring demand.',
                status: 'pending',
                dueDateOffsetDays: 5,
                contactEmail: 'anna.kowalska@folga.com.pl',
            },
        ],
        activities: [
            {
                id: 'ref-activity-folga-discovery',
                type: 'NOTE',
                subject: 'Discovery summary captured',
                body: 'Folga wants a first rollout focused on recruiter coordination, company-level CRM visibility, and structured follow-up for inbound employer leads.',
                contactEmail: 'anna.kowalska@folga.com.pl',
            },
            {
                id: 'ref-activity-folga-call',
                type: 'CALL',
                subject: 'Qualification call completed',
                body: 'Anna confirmed the need for shared deal tracking and clearer ownership before August hiring demand increases.',
                contactEmail: 'anna.kowalska@folga.com.pl',
            },
            {
                id: 'ref-activity-folga-ops-meeting',
                type: 'MEETING',
                subject: 'Operations alignment meeting scheduled',
                body: 'Marek Zielinski will join the next review to validate rollout scope, migration priorities, and onboarding sequence.',
                contactEmail: 'marek.zielinski@folga.com.pl',
            },
        ],
        auditLogs: [
            {
                id: 'ref-audit-folga-company',
                action: 'reference_company_seeded',
                entityType: 'company',
                target: 'company',
                metadataJson: { scenario: 'folga_recruitment_expansion' },
            },
            {
                id: 'ref-audit-folga-primary-contact',
                action: 'reference_contact_seeded',
                entityType: 'contact',
                target: { contactEmail: 'anna.kowalska@folga.com.pl' },
                metadataJson: { scenario: 'folga_recruitment_expansion', role: 'primary' },
            },
            {
                id: 'ref-audit-folga-deal',
                action: 'reference_deal_seeded',
                entityType: 'deal',
                target: 'deal',
                metadataJson: { scenario: 'folga_recruitment_expansion', stage: 'Qualified' },
            },
        ],
    },
];
