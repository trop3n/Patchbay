'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SystemBuild } from '@prisma/client'

type SystemBuildWithRelations = SystemBuild & {
  system: { name: string; slug: string } | null
  createdBy: { name: string | null; username: string }
}

interface SystemBuildListProps {
  builds: SystemBuildWithRelations[]
}

export function SystemBuildList({ builds }: SystemBuildListProps) {
  if (builds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No system builds found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {builds.map((build) => {
        const data = build.data as { nodes?: unknown[]; edges?: unknown[] } | null
        const nodeCount = data?.nodes?.length ?? 0
        const edgeCount = data?.edges?.length ?? 0

        return (
          <Card key={build.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={`/system-builder/${build.id}`} className="hover:underline">
                  {build.title}
                </Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {nodeCount > 0 && <span>{nodeCount} devices</span>}
                {edgeCount > 0 && <span>&middot; {edgeCount} connections</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                {build.description && (
                  <p className="line-clamp-2">{build.description}</p>
                )}
                {build.system && (
                  <p>
                    System:{' '}
                    <Link href={`/systems/${build.system.slug}`} className="hover:underline">
                      {build.system.name}
                    </Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
