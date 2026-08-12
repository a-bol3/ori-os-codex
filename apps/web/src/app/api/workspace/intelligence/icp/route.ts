import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceRequestContext } from "@/app/api/workspace/_lib/request-context";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await resolveWorkspaceRequestContext();
    if (!context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const items = await prisma.icpProfile.findMany({
      where: { organizationId: context.organizationId },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ items, total: items.length }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[workspace/intelligence/icp] GET failed", error);
    return NextResponse.json({ error: "Unable to load ICP profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await resolveWorkspaceRequestContext();
    if (!context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const criteriaJson = body.criteriaJson;
    if (!name || !criteriaJson || typeof criteriaJson !== "object" || Array.isArray(criteriaJson)) {
      return NextResponse.json({ error: "Name and criteriaJson are required" }, { status: 400 });
    }
    const profile = await prisma.icpProfile.create({
      data: {
        organizationId: context.organizationId,
        name,
        criteriaJson: criteriaJson as object,
        blacklistPersonasJson: (body.blacklistPersonasJson as object | undefined) ?? undefined,
        regionsJson: (body.regionsJson as object | undefined) ?? undefined,
      },
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("[workspace/intelligence/icp] POST failed", error);
    return NextResponse.json({ error: "Unable to create ICP profile" }, { status: 500 });
  }
}
