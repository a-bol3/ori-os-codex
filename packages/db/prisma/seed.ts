
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Default Organization
    const org = await prisma.organization.upsert({
        where: { slug: 'ori-labs' },
        update: {},
        create: {
            id: 'mock-org-id', // Stable ID for dev bypass
            name: 'Ori Craft Labs',
            slug: 'ori-labs',
            complianceProfile: 'standard',
        },
    });

    console.log(`Created Organization: ${org.name} (${org.id})`);

    // 2. Create Admin User
    const user = await prisma.user.upsert({
        where: { email: 'admin@oricraftlabs.com' },
        update: {},
        create: {
            email: 'admin@oricraftlabs.com',
            name: 'Admin User',
            passwordHash: 'hashed_password_placeholder', // TODO: Implement real hash
            memberships: {
                create: {
                    organizationId: org.id,
                    role: 'OWNER',
                },
            },
        },
    });

    console.log(`Created User: ${user.name} (${user.id})`);

    // 3. Create Companies (Realistic Names)
    const companiesData = [
        { name: 'TechCorp Solutions', domain: 'techcorp.com', industry: 'SaaS', sizeBand: '500-1000', country: 'US', city: 'San Francisco' },
        { name: 'GreenGrid Energy', domain: 'greengrid.io', industry: 'Renewables', sizeBand: '100-250', country: 'DE', city: 'Berlin' },
        { name: 'CloudScale AI', domain: 'cloudscale.ai', industry: 'AI/ML', sizeBand: '50-100', country: 'UK', city: 'London' },
        { name: 'BuildWise Construction', domain: 'buildwise.com', industry: 'Construction', sizeBand: '1000-5000', country: 'CA', city: 'Toronto' },
        { name: 'FinFlow Payments', domain: 'finflow.ch', industry: 'Fintech', sizeBand: '250-500', country: 'CH', city: 'Zurich' },
        { name: 'HealthPulse Systems', domain: 'healthpulse.org', industry: 'Healthcare', sizeBand: '100-250', country: 'US', city: 'Boston' },
        { name: 'SwiftLogistics', domain: 'swiftlog.com', industry: 'Logistics', sizeBand: '500-1000', country: 'NL', city: 'Amsterdam' },
        { name: 'EduTrack Learning', domain: 'edutrack.edu', industry: 'EdTech', sizeBand: '10-50', country: 'AU', city: 'Sydney' },
        { name: 'PureAqua Water', domain: 'pureaqua.eco', industry: 'Manufacturing', sizeBand: '50-100', country: 'SG', city: 'Singapore' },
        { name: 'CyberGuard Security', domain: 'cyberguard.net', industry: 'Cybersecurity', sizeBand: '250-500', country: 'IL', city: 'Tel Aviv' },
    ].map(data => ({ ...data, organizationId: org.id }));

    const companies = [];
    for (const data of companiesData) {
        const company = await prisma.company.upsert({
            where: { id: `mock-company-${data.domain}` }, // Using stable ID for idempotency in dev
            update: data,
            create: { ...data, id: `mock-company-${data.domain}` },
        });
        companies.push(company);
    }

    console.log(`Created/Updated ${companies.length} Realistic Companies`);

    // 4. Create Contacts (50 Realistic Profiles)
    const jobTitles = ['CEO', 'CTO', 'VP of Sales', 'Head of Marketing', 'Operations Director', 'Product Manager', 'Lead Engineer', 'HR Manager'];
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];

    const contactsData = Array.from({ length: 50 }).map((_, i) => {
        const company = companies[i % companies.length];
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.domain}`;

        return {
            organizationId: org.id,
            companyId: company.id,
            firstName,
            lastName,
            email,
            jobTitle: jobTitles[i % jobTitles.length],
            country: company.country,
            emailStatus: 'VALID' as const,
        };
    });

    let contactCount = 0;
    for (const data of contactsData) {
        await prisma.contact.upsert({
            where: { organizationId_email: { organizationId: org.id, email: data.email } },
            update: data,
            create: data,
        });
        contactCount++;
    }

    console.log(`Successfully Seeded ${contactCount} Detailed Contacts`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
