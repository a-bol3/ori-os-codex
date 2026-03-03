import { NextResponse } from "next/server";

export async function GET() {
    const emailLimit = 500;
    const emailsUsed = 0;

    return NextResponse.json({
        isPro: false,
        emailLimit,
        emailsUsed,
        emailsRemaining: Math.max(0, emailLimit - emailsUsed),
        periodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    });
}
