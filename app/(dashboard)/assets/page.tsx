import { Suspense } from 'react'
import { getFilteredAssets, getAssetFilterOptions, type AssetFilters } from '@/app/actions/assets'
import { AssetList } from '@/components/assets/asset-list'
import { AssetListFilter } from '@/components/assets/asset-list-filter'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { AssetStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface AssetsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    systemId?: string
  }>
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const params = await searchParams
  
  const filters: AssetFilters = {
    search: params.search,
    status: params.status as AssetStatus,
    systemId: params.systemId,
  }
  
  const [assets, filterOptions] = await Promise.all([
    getFilteredAssets(filters),
    getAssetFilterOptions(),
  ])

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
      <Suspense fallback={<div>Loading filters...</div>}>
        <AssetListFilter systems={filterOptions.systems} />
      </Suspense>
      <AssetList assets={assets} />
    </div>
  )
}
