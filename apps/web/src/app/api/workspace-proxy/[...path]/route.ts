import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    if (!ALLOWED_METHODS.has(request.method)) {
        return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
    }

    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    });
    const accessToken = typeof token?.accessToken === "string" ? token.accessToken : undefined;
    if (!accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { path } = await context.params;
    if (!path.length || path.some((part) => !part || part === "." || part === "..")) {
        return NextResponse.json({ message: "Invalid API path" }, { status: 400 });
    }

    const upstreamPath = path.map(encodeURIComponent).join("/");
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    const accept = request.headers.get("accept");
    if (contentType) headers.set("content-type", contentType);
    if (accept) headers.set("accept", accept);
    headers.set("authorization", `Bearer ${accessToken}`);

    const response = await fetch(`${getApiBaseUrl()}/${upstreamPath}${request.nextUrl.search}`, {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "DELETE" ? undefined : await request.arrayBuffer(),
        cache: "no-store",
    });

    const responseHeaders = new Headers();
    for (const header of ["content-type", "content-disposition"]) {
        const value = response.headers.get(header);
        if (value) responseHeaders.set(header, value);
    }
    return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
