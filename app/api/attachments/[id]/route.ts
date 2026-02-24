import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const attachment = await prisma.attachment.findUnique({
    where: { id },
  })

  if (!attachment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const fileBuffer = await readFile(attachment.path)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Disposition': `attachment; filename="${attachment.originalName}"`,
        'Content-Length': attachment.size.toString(),
      },
    })
  } catch (error) {
    console.error('Failed to read file:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
