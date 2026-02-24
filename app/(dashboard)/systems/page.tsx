import { Suspense } from 'react'
import { getFilteredSystems, getSystemFilterOptions, type SystemFilters } from '@/app/actions/systems'
import { SystemList } from '@/components/systems/system-list'
import { SystemListFilter } from '@/components/systems/system-list-filter'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SystemsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    category?: string
  }>
}

export default async function SystemsPage({ searchParams }: SystemsPageProps) {
  const params = await searchParams
  
  const filters: SystemFilters = {
    search: params.search,
    status: params.status as SystemFilters['status'],
    category: params.category,
  }
  
  const [systems, filterOptions] = await Promise.all([
    getFilteredSystems(filters),
    getSystemFilterOptions(),
  ])

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
      <Suspense fallback={<div>Loading filters...</div>}>
        <SystemListFilter categories={filterOptions.categories} />
      </Suspense>
      <SystemList systems={systems} />
    </div>
  )
}
