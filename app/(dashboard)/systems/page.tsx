import { prisma } from '@/lib/prisma'
import { SystemList } from '@/components/systems/system-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SystemsPage() {
  const systems = await prisma.system.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { name: true, username: true } },
      _count: { select: { diagrams: true, assets: true, devices: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Systems</h1>
          <p className="text-muted-foreground">Manage your A/V systems and equipment</p>
        </div>
        <Button asChild>
          <Link href="/systems/new">
            <Plus className="w-4 h-4 mr-2" />
            Add System
          </Link>
        </Button>
      </div>
      <SystemList systems={systems} />
    </div>
  )
}
