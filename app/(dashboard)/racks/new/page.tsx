import { prisma } from '@/lib/prisma'
import { RackForm } from '@/components/racks/rack-form'

export const dynamic = 'force-dynamic'

export default async function NewRackPage() {
  const [systems, assets] = await Promise.all([
    prisma.system.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.asset.findMany({
      select: { id: true, name: true, manufacturer: true, model: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <RackForm systems={systems} assets={assets} />
    </div>
  )
}
