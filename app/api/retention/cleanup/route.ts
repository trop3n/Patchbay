import { NextResponse } from 'next/server'
import { runCleanup } from '@/app/actions/retention'

export async function POST() {
  try {
    const result = await runCleanup()
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, stats: result.stats })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
