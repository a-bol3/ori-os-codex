import { PrismaClient } from '@ori-os/db'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaConnected: boolean | undefined
}

let connectionTested = false
let isConnected = false

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? [] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Try to run a DB operation, returning null if the database is unavailable.
 * Use this in API routes to gracefully degrade when no DB is present.
 */
export async function withDb<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T | null> {
  // Quick check: if we already know connection is down, skip
  if (connectionTested && !isConnected) return null

  try {
    if (!connectionTested) {
      await db.$queryRawUnsafe('SELECT 1')
      connectionTested = true
      isConnected = true
    }
    return await fn(db)
  } catch (error: any) {
    // If it's a connection error, mark as disconnected
    if (
      error?.code === 'P1001' || // Can't reach database server
      error?.code === 'P1002' || // Timed out
      error?.code === 'P1003' || // Database not found
      error?.code === 'P1010' || // Access denied
      error?.message?.includes('ECONNREFUSED') ||
      error?.message?.includes('ENOTFOUND') ||
      error?.message?.includes('connect')
    ) {
      connectionTested = true
      isConnected = false
      console.warn('[DB] Database unavailable, using demo data fallback')
      return null
    }
    // Re-throw non-connection errors
    throw error
  }
}