import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        accessToken?: string;
        organizationId?: string;
    }

    interface Session extends DefaultSession {
        accessToken?: string;
        organizationId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        organizationId?: string;
    }
}
