import { Suspense } from 'react'
import { search } from '@/app/actions/search'
import { SearchForm, SearchResults } from '@/components/search/search-form'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const results = q ? await search(q) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find systems, documents, diagrams, and assets</p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchForm />
      </Suspense>
      <Suspense fallback={<div>Searching...</div>}>
        <SearchResults results={results} query={q || ''} />
      </Suspense>
    </div>
  )
}
