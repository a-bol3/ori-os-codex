import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@ori-os/db"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub,
        Google,
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // Bypass auth in development if configured
            if (process.env.ORI_AUTH_BYPASS === '1') {
                return true
            }

            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect to login page
            }
            return true
        },
        async session({ session, user, token }) {
            // Fetch the user's primary organization if not already present
            // In a real multi-tenant app, you'd allow switching organizations
            if (session.user && !session.user.organizationId) {
                const membership = await prisma.organizationMember.findFirst({
                    where: { userId: session.user.id },
                    select: { organizationId: true }
                });
                if (membership) {
                    session.user.organizationId = membership.organizationId;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
})
