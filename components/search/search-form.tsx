'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search as SearchIcon, Monitor, FileText, GitBranch, Package, Server, X } from 'lucide-react'

interface SearchResult {
  type: 'system' | 'document' | 'diagram' | 'asset' | 'rack'
  id: string
  title: string
  description?: string | null
  url: string
  meta?: string
}

const typeIcons: Record<string, React.ReactNode> = {
  system: <Monitor className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  diagram: <GitBranch className="w-4 h-4" />,
  asset: <Package className="w-4 h-4" />,
  rack: <Server className="w-4 h-4" />,
}

export function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function clearSearch() {
    setQuery('')
    router.push('/search')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search systems, documents, diagrams, assets..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  )
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (!query) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <SearchIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Enter a search term to find systems, documents, diagrams, and assets.</p>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
      </p>
      <div className="grid gap-3">
        {results.map((result) => (
          <Link key={`${result.type}-${result.id}`} href={result.url}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="mt-0.5 text-muted-foreground">
                  {typeIcons[result.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{result.title}</h3>
                  {result.description && (
                    <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                  )}
                  {result.meta && (
                    <p className="text-xs text-muted-foreground mt-1">{result.meta}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
