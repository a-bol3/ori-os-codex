
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { referenceScenarios } from './reference-scenarios';

const prisma = new PrismaClient();

async function main() {
    /**
     * Seeding policy:
     * - production bootstrap must stay minimal and intentional;
     * - scenario/demo/reference data should be coherent and linked across modules;
     * - random placeholder production data is not allowed.
     *
     * See docs/REFERENCE_SCENARIO_STRATEGY.md for the long-term rule set.
     */
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && process.env.ORI_ALLOW_PRODUCTION_SEED !== '1') {
        throw new Error('Production seed is disabled. Set ORI_ALLOW_PRODUCTION_SEED=1 for an intentional bootstrap.');
    }

    const orgSlug = process.env.ORI_SEED_ORG_SLUG?.trim().toLowerCase() || 'ori-os';
    const orgName = process.env.ORI_SEED_ORG_NAME?.trim() || 'Ori Os';
    const adminEmail = process.env.ORI_SEED_ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ORI_SEED_ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        throw new Error('ORI_SEED_ADMIN_EMAIL and ORI_SEED_ADMIN_PASSWORD are required');
    }
    if (adminPassword.length < 12) {
        throw new Error('ORI_SEED_ADMIN_PASSWORD must contain at least 12 characters');
    }

    console.log('Seeding database...');

    // 1. Create Default Organization
    const org = await prisma.organization.upsert({
        where: { slug: orgSlug },
        update: { name: orgName },
        create: {
            name: orgName,
            slug: orgSlug,
            complianceProfile: 'standard',
        },
    });

    console.log(`Created Organization: ${org.name} (${org.id})`);

    // 2. Create Admin User
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { passwordHash },
        create: {
            email: adminEmail,
            name: 'Admin User',
            passwordHash,
        },
    });

    await prisma.organizationMembership.upsert({
        where: {
            organizationId_userId: {
                organizationId: org.id,
                userId: user.id,
            },
        },
        update: { role: 'OWNER' },
        create: {
            organizationId: org.id,
            userId: user.id,
            role: 'OWNER',
        },
    });

    console.log(`Created User: ${user.name} (${user.id})`);

    const pipeline = await prisma.pipeline.upsert({
        where: { id: 'ref-pipeline-primary-sales' },
        update: {
            organizationId: org.id,
            name: 'Primary Sales Pipeline',
        },
        create: {
            id: 'ref-pipeline-primary-sales',
            organizationId: org.id,
            name: 'Primary Sales Pipeline',
        },
    });

    const stageDefinitions = [
        { id: 'ref-stage-lead', name: 'Lead', order: 1 },
        { id: 'ref-stage-qualified', name: 'Qualified', order: 2 },
        { id: 'ref-stage-proposal', name: 'Proposal', order: 3 },
        { id: 'ref-stage-negotiation', name: 'Negotiation', order: 4 },
        { id: 'ref-stage-closed-won', name: 'Closed Won', order: 5 },
    ];

    for (const stage of stageDefinitions) {
        await prisma.pipelineStage.upsert({
            where: { id: stage.id },
            update: {
                pipelineId: pipeline.id,
                name: stage.name,
                order: stage.order,
            },
            create: {
                id: stage.id,
                pipelineId: pipeline.id,
                name: stage.name,
                order: stage.order,
            },
        });
    }

    const stageByName = Object.fromEntries(stageDefinitions.map((stage) => [stage.name, stage.id]));
    let seededCompanies = 0;
    let seededContacts = 0;
    let seededDeals = 0;
    let seededTasks = 0;
    let seededActivities = 0;
    let seededAuditLogs = 0;

    for (const scenario of referenceScenarios) {
        const company = await prisma.company.upsert({
            where: { id: scenario.company.id },
            update: {
                organizationId: org.id,
                name: scenario.company.name,
                website: scenario.company.website,
                domain: scenario.company.domain,
                industry: scenario.company.industry,
                sizeBand: scenario.company.sizeBand,
                country: scenario.company.country,
                city: scenario.company.city,
                linkedinUrl: scenario.company.linkedinUrl,
                customFieldsJson: { referenceScenario: scenario.key },
            },
            create: {
                id: scenario.company.id,
                organizationId: org.id,
                name: scenario.company.name,
                website: scenario.company.website,
                domain: scenario.company.domain,
                industry: scenario.company.industry,
                sizeBand: scenario.company.sizeBand,
                country: scenario.company.country,
                city: scenario.company.city,
                linkedinUrl: scenario.company.linkedinUrl,
                customFieldsJson: { referenceScenario: scenario.key },
            },
        });
        seededCompanies++;

        const contactsByEmail = new Map<string, { id: string }>();
        for (const contact of scenario.contacts) {
            const record = await prisma.contact.upsert({
                where: {
                    organizationId_email: {
                        organizationId: org.id,
                        email: contact.email,
                    },
                },
                update: {
                    companyId: company.id,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    email: contact.email,
                    jobTitle: contact.jobTitle,
                    country: contact.country ?? company.country,
                    emailStatus: contact.emailStatus ?? 'VALID',
                    customFieldsJson: { referenceScenario: scenario.key },
                },
                create: {
                    id: contact.id,
                    organizationId: org.id,
                    companyId: company.id,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    email: contact.email,
                    jobTitle: contact.jobTitle,
                    country: contact.country ?? company.country,
                    emailStatus: contact.emailStatus ?? 'VALID',
                    customFieldsJson: { referenceScenario: scenario.key },
                },
            });
            contactsByEmail.set(contact.email, { id: record.id });
            seededContacts++;
        }

        const primaryContact = contactsByEmail.get(scenario.deal.primaryContactEmail);
        if (!primaryContact) {
            throw new Error(`Primary contact ${scenario.deal.primaryContactEmail} not found for scenario ${scenario.key}`);
        }

        const closeDate = new Date();
        closeDate.setUTCDate(closeDate.getUTCDate() + scenario.deal.closeDateOffsetDays);
        closeDate.setUTCHours(0, 0, 0, 0);

        const deal = await prisma.deal.upsert({
            where: { id: scenario.deal.id },
            update: {
                organizationId: org.id,
                companyId: company.id,
                contactId: primaryContact.id,
                pipelineId: pipeline.id,
                stageId: stageByName[scenario.deal.stageName],
                name: scenario.deal.name,
                valueCurrency: scenario.deal.valueCurrency,
                valueAmount: scenario.deal.valueAmount,
                status: scenario.deal.status ?? 'open',
                closeDate,
            },
            create: {
                id: scenario.deal.id,
                organizationId: org.id,
                companyId: company.id,
                contactId: primaryContact.id,
                pipelineId: pipeline.id,
                stageId: stageByName[scenario.deal.stageName],
                name: scenario.deal.name,
                valueCurrency: scenario.deal.valueCurrency,
                valueAmount: scenario.deal.valueAmount,
                status: scenario.deal.status ?? 'open',
                closeDate,
            },
        });
        seededDeals++;

        for (const task of scenario.tasks) {
            const taskContact = task.contactEmail ? contactsByEmail.get(task.contactEmail) : undefined;
            const dueDate = typeof task.dueDateOffsetDays === 'number'
                ? new Date(Date.now() + task.dueDateOffsetDays * 24 * 60 * 60 * 1000)
                : null;

            await prisma.task.upsert({
                where: { id: task.id },
                update: {
                    organizationId: org.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    dueDate,
                    companyId: company.id,
                    contactId: taskContact?.id ?? null,
                    dealId: deal.id,
                },
                create: {
                    id: task.id,
                    organizationId: org.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    dueDate,
                    companyId: company.id,
                    contactId: taskContact?.id,
                    dealId: deal.id,
                },
            });
            seededTasks++;
        }

        for (const activity of scenario.activities) {
            const activityContact = activity.contactEmail ? contactsByEmail.get(activity.contactEmail) : undefined;

            await prisma.activity.upsert({
                where: { id: activity.id },
                update: {
                    organizationId: org.id,
                    type: activity.type,
                    userId: user.id,
                    companyId: company.id,
                    contactId: activityContact?.id ?? null,
                    dealId: deal.id,
                    subject: activity.subject,
                    body: activity.body,
                    metadataJson: { referenceScenario: scenario.key },
                },
                create: {
                    id: activity.id,
                    organizationId: org.id,
                    type: activity.type,
                    userId: user.id,
                    companyId: company.id,
                    contactId: activityContact?.id,
                    dealId: deal.id,
                    subject: activity.subject,
                    body: activity.body,
                    metadataJson: { referenceScenario: scenario.key },
                },
            });
            seededActivities++;
        }

        for (const auditLog of scenario.auditLogs) {
            const targetEntityId =
                auditLog.target === 'company'
                    ? company.id
                    : auditLog.target === 'deal'
                        ? deal.id
                        : contactsByEmail.get(auditLog.target.contactEmail)?.id;

            await prisma.auditLog.upsert({
                where: { id: auditLog.id },
                update: {
                    organizationId: org.id,
                    userId: user.id,
                    action: auditLog.action,
                    entityType: auditLog.entityType,
                    entityId: targetEntityId ?? null,
                    metadataJson: {
                        referenceScenario: scenario.key,
                        ...(auditLog.metadataJson ?? {}),
                    },
                },
                create: {
                    id: auditLog.id,
                    organizationId: org.id,
                    userId: user.id,
                    action: auditLog.action,
                    entityType: auditLog.entityType,
                    entityId: targetEntityId,
                    metadataJson: {
                        referenceScenario: scenario.key,
                        ...(auditLog.metadataJson ?? {}),
                    },
                },
            });
            seededAuditLogs++;
        }
    }

    console.log(`Seeded ${referenceScenarios.length} reference scenario(s)`);
    console.log(`Companies: ${seededCompanies}`);
    console.log(`Contacts: ${seededContacts}`);
    console.log(`Deals: ${seededDeals}`);
    console.log(`Tasks: ${seededTasks}`);
    console.log(`Activities: ${seededActivities}`);
    console.log(`Audit logs: ${seededAuditLogs}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
