import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"

const nextAuth = NextAuth({
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "generate-a-random-secret",
    trustHost: true,
    session: { strategy: "jwt" },
    debug: true,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const isAuthBypass = process.env.ORI_AUTH_BYPASS === "1" || process.env.AUTH_BYPASS === "true";
                console.log("[Auth] Authorize called:", { email: credentials?.email, isAuthBypass });

                // For demo/dev: allow any password for admin@ori-os.com
                if (isAuthBypass && credentials?.email === "admin@ori-os.com") {
                    return {
                        id: "dev-admin",
                        name: "Admin User",
                        email: "admin@ori-os.com",
                    };
                }

                // In a real app, you would check the database here
                // For now, if bypass is on, allow any login to proceed as a dev user
                if (isAuthBypass && credentials?.email) {
                    return {
                        id: "dev-user",
                        name: "Developer",
                        email: credentials.email as string,
                    };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthBypass = process.env.ORI_AUTH_BYPASS === "1" || process.env.AUTH_BYPASS === "true";

            const isAuthPage = nextUrl.pathname.startsWith("/login") ||
                nextUrl.pathname.startsWith("/register");
            const isDashboard = nextUrl.pathname.startsWith("/dashboard");

            // If on auth page and logged in (or bypass), redirect to dashboard
            if (isAuthPage) {
                if (isLoggedIn || isAuthBypass) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            if (isDashboard) {
                if (isLoggedIn || isAuthBypass) return true;
                return false;
            }

            return true;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                session.user.name = token.name;
                session.user.email = token.email as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        }
    },
})


export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth as any;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
