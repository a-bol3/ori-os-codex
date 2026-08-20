import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        organizationId?: string;
    }

    interface Session extends DefaultSession {
        organizationId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        organizationId?: string;
    }
}
