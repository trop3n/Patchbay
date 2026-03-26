import { prisma } from '@/lib/prisma'
import { getSystemSelectOptions } from '@/app/actions/systems'
import { RackForm } from '@/components/racks/rack-form'

export const dynamic = 'force-dynamic'

export default async function NewRackPage() {
  const [systems, assets] = await Promise.all([
    getSystemSelectOptions(),
    prisma.asset.findMany({
      select: { id: true, name: true, manufacturer: true, model: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="h-full">
      <RackForm systems={systems} assets={assets} />
    </div>
  )
}
