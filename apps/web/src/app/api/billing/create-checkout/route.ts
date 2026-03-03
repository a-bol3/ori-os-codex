import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const returnUrl = body?.returnUrl || "/dashboard/billing";

    return NextResponse.json({
        url: null,
        message:
            "Checkout is not configured yet. Add Stripe server integration to enable upgrades.",
        returnUrl,
    });
}
