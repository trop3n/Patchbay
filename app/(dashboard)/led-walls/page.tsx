import { getLedWalls } from '@/app/actions/led-walls'
import { LedWallList } from '@/components/led-walls/led-wall-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LedWallsPage() {
  const ledWalls = await getLedWalls()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LED Walls</h1>
          <p className="text-muted-foreground">LED video wall and strip layout configurations</p>
        </div>
        <Button asChild>
          <Link href="/led-walls/new">
            <Plus className="w-4 h-4 mr-2" />
            Add LED Wall
          </Link>
        </Button>
      </div>
      <LedWallList ledWalls={ledWalls} />
    </div>
  )
}
