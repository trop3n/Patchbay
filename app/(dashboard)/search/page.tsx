import { Suspense } from 'react'
import { search, type SearchFilters } from '@/app/actions/search'
import { SearchForm, SearchResults } from '@/components/search/search-form'
import { SearchFiltersPanel } from '@/components/search/search-filters'

interface SearchPageProps {
  searchParams: Promise<{ 
    q?: string
    types?: string
    status?: string
    category?: string
    systemId?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const { q } = params
  
  const filters: SearchFilters = {
    types: params.types?.split(',').filter(Boolean) as SearchFilters['types'],
    status: params.status?.split(',').filter(Boolean),
    category: params.category || undefined,
    systemId: params.systemId || undefined,
  }
  
  const results = q ? await search(q, filters) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find systems, documents, diagrams, and assets</p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchForm />
      </Suspense>
      <Suspense fallback={<div>Loading filters...</div>}>
        <SearchFiltersPanel />
      </Suspense>
      <Suspense fallback={<div>Searching...</div>}>
        <SearchResults results={results} query={q || ''} />
      </Suspense>
    </div>
  )
}
