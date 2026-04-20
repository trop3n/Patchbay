'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Blocks, Cable, Cpu } from 'lucide-react'
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
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Blocks className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-1 font-medium">No system builds yet</p>
          <p className="text-sm text-muted-foreground/70">
            Create your first build to start designing hardware layouts
          </p>
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
          <Link key={build.id} href={`/system-builder/${build.id}`} className="group">
            <Card className="h-full hover:border-primary/50 transition-all duration-200 cursor-pointer group-hover:shadow-lg group-hover:shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {build.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-3">
                  {nodeCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {nodeCount} devices
                    </span>
                  )}
                  {edgeCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Cable className="w-3 h-3" />
                      {edgeCount} connections
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {build.description && (
                    <p className="line-clamp-2">{build.description}</p>
                  )}
                  {build.system && (
                    <p className="text-xs">
                      System: {build.system.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60">
                    by {build.createdBy.name || build.createdBy.username}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
