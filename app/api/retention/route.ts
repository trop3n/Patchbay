import { NextRequest, NextResponse } from 'next/server'
import { updateRetentionSettings } from '@/app/actions/retention'

export async function PUT(request: NextRequest) {
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
