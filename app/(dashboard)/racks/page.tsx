import { prisma } from '@/lib/prisma'
import { RackList } from '@/components/racks/rack-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RacksPage() {
  const racks = await prisma.rack.findMany({
    orderBy: { name: 'asc' },
    include: {
      system: { select: { name: true, slug: true } },
      createdBy: { select: { name: true, username: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Racks</h1>
          <p className="text-muted-foreground">Equipment rack layouts and configurations</p>
        </div>
        <Button asChild>
          <Link href="/racks/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Rack
          </Link>
        </Button>
      </div>
      <RackList racks={racks} />
    </div>
  )
}
