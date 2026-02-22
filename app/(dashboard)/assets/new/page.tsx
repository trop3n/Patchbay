import { prisma } from '@/lib/prisma'
import { AssetForm } from '@/components/assets/asset-form'

export const dynamic = 'force-dynamic'

export default async function NewAssetPage() {
  const systems = await prisma.system.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <AssetForm systems={systems} />
    </div>
  )
}
