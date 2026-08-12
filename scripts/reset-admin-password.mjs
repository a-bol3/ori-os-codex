import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function readArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

async function main() {
  const email = (readArg('email') || process.env.ORI_RESET_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = readArg('password') || process.env.ORI_RESET_ADMIN_PASSWORD || '';
  const organizationSlug = (readArg('org') || process.env.ORI_RESET_ADMIN_ORG || 'ori-labs').trim();

  if (!email || !password) {
    throw new Error(
      'Missing credentials. Provide --email=... --password=... or set ORI_RESET_ADMIN_EMAIL and ORI_RESET_ADMIN_PASSWORD.',
    );
  }

  if (password.length < 12) {
    throw new Error('Admin password must contain at least 12 characters.');
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  if (!organization) {
    throw new Error(`Organization not found for slug "${organizationSlug}".`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Admin User',
      passwordHash,
    },
    create: {
      email,
      name: 'Admin User',
      passwordHash,
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: {
      role: 'OWNER',
    },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        email: user.email,
        organizationSlug: organization.slug,
        role: 'OWNER',
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
