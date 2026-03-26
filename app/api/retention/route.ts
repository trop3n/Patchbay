import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateRetentionSettings } from '@/app/actions/retention'

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const result = await updateRetentionSettings(body)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, policy: result.policy })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
