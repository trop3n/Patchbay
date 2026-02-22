import { prisma } from '@/lib/prisma'
import { AssetList } from '@/components/assets/asset-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
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
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">Equipment and inventory management</p>
        </div>
        <Button asChild>
          <Link href="/assets/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Link>
        </Button>
      </div>
      <AssetList assets={assets} />
    </div>
  )
}
