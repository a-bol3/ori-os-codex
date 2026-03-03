import { withDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await withDb(async (db) => db.emailTemplate.findUnique({ where: { id } }))
    if (!result) return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch template' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    if (body.name) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.category) updateData.category = body.category
    if (body.subject) updateData.subject = body.subject
    if (body.previewText !== undefined) updateData.previewText = body.previewText
    if (body.bodyHtml) updateData.bodyHtml = body.bodyHtml
    if (body.bodyText !== undefined) updateData.bodyText = body.bodyText
    if (body.variables) updateData.variables = JSON.stringify(body.variables)

    const result = await withDb(async (db) => db.emailTemplate.update({ where: { id }, data: updateData }))
    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await withDb(async (db) => db.emailTemplate.delete({ where: { id } }))
    if (!result) return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    return NextResponse.json({ success: true, message: 'Template deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete template' }, { status: 500 })
  }
}
