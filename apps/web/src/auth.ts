import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { hasUsableSession } from "./lib/session-guards";

type ApiLoginResult = {
    access_token: string;
    refresh_token: string;
    organizationId: string;
    user: { id: string; name?: string | null; email: string };
};

const authSecret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test" ||
        process.env.CI === "true"
        ? "ci-build-only-secret"
        : undefined);

if (!authSecret) {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required outside development");
}

const nextAuth = NextAuth({
    secret: authSecret,
    trustHost: true,
    session: { strategy: "jwt" },
    debug: process.env.NODE_ENV === "development",
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email?.toString().trim().toLowerCase();
                const password = credentials?.password?.toString() ?? "";

                if (!email || !password) {
                    return null;
                }

                const apiBaseUrl =
                    process.env.API_URL ||
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:4000";

                try {
                    const response = await fetch(`${apiBaseUrl}/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!response.ok) {
                        return null;
                    }

                    const result = await response.json() as ApiLoginResult;
                    const user = result?.user;

                    if (!user?.email || !result.access_token || !result.organizationId) {
                        return null;
                    }

                    return {
                        id: user.id ?? user.email,
                        name: user.name ?? "Ori-OS User",
                        email: user.email,
                        accessToken: result.access_token,
                        refreshToken: result.refresh_token,
                        organizationId: result.organizationId,
                    };
                } catch (error) {
                    console.error("[Auth] API login failed", error);
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
            const isAuthPage = nextUrl.pathname.startsWith("/login") ||
                nextUrl.pathname.startsWith("/register");
            const isDashboard = nextUrl.pathname.startsWith("/dashboard");
            const hasSession = hasUsableSession(auth);

            // Only redirect away from auth pages once a session exists.
            if (isAuthPage) {
                if (hasSession) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            if (isDashboard) {
                if (hasSession) return true;
                return false;
            }

            return true;
        },
        async session({ session, token }) {
            if (token && session.user) {
                const enrichedSession = session as typeof session & {
                    organizationId?: string;
                };

                session.user.id = token.sub as string;
                session.user.name = typeof token.name === "string" ? token.name : undefined;
                session.user.email = token.email as string;
                enrichedSession.organizationId = typeof token.organizationId === "string" ? token.organizationId : undefined;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                const enrichedUser = user as typeof user & {
                    accessToken?: string;
                    refreshToken?: string;
                    organizationId?: string;
                };

                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.accessToken = enrichedUser.accessToken;
                token.refreshToken = enrichedUser.refreshToken;
                token.organizationId = enrichedUser.organizationId;
            }
            return token;
        }
    },
    events: {
        async signOut(message) {
            if (!("token" in message)) return;

            const { token } = message;
            const accessToken = typeof token?.accessToken === "string" ? token.accessToken : undefined;
            if (!accessToken) return;

            const apiBaseUrl =
                process.env.API_URL ||
                process.env.NEXT_PUBLIC_API_URL ||
                "http://localhost:4000";

            try {
                await fetch(`${apiBaseUrl}/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            } catch (error) {
                console.error("[Auth] API logout failed", error);
            }
        },
    },
})


export const handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
