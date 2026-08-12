'use server';

import bcrypt from "bcrypt";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function loginAction(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

export async function registerAction(formData: FormData) {
    try {
        const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
        const lastName = (formData.get("lastName") as string | null)?.trim() ?? "";
        const company = (formData.get("company") as string | null)?.trim() ?? "";
        const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
        const password = (formData.get("password") as string | null) ?? "";
        const acceptedTerms = formData.get("terms");

        if (!firstName || !lastName || !email || !password) {
            return "Please complete all required fields.";
        }

        if (!acceptedTerms) {
            return "You must accept the terms to continue.";
        }

        if (password.length < 8) {
            return "Password must be at least 8 characters long.";
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (existingUser) {
            return "An account with this email already exists.";
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const organizationName = company || `${firstName} ${lastName}'s Workspace`;
        const slugBase = slugify(company || email.split("@")[0] || "workspace") || "workspace";

        let organizationSlug = slugBase;
        let suffix = 1;
        while (await prisma.organization.findUnique({ where: { slug: organizationSlug }, select: { id: true } })) {
            suffix += 1;
            organizationSlug = `${slugBase}-${suffix}`;
        }

        await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: organizationName,
                    slug: organizationSlug,
                    complianceProfile: "standard",
                },
            });

            await tx.user.create({
                data: {
                    email,
                    name: `${firstName} ${lastName}`.trim(),
                    passwordHash,
                    memberships: {
                        create: {
                            organizationId: organization.id,
                            role: "OWNER",
                        },
                    },
                },
            });
        });

        return null;
    } catch (error) {
        if (error instanceof AuthError) {
            return "Registration failed. Please try again.";
        }
        console.error("[Auth] registerAction failed", error);
        throw error;
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: "/" });
}
