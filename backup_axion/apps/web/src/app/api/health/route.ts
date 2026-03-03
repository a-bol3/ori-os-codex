import { NextResponse } from 'next/server'
import { withDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    const healthInfo: any = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        services: {
            web: 'UP',
        }
    }

    try {
        // Check Database connection
        const dbStatus = await withDb(async (db) => {
            await db.$queryRaw`SELECT 1`
            return 'UP'
        })
        healthInfo.services.database = dbStatus || 'DOWN'
    } catch (error) {
        healthInfo.services.database = 'DOWN'
        healthInfo.status = 'DEGRADED'
    }

    const statusCode = healthInfo.status === 'UP' ? 200 : 503
    return NextResponse.json(healthInfo, { status: statusCode })
}
