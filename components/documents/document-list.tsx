'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Document } from '@prisma/client'

type DocumentWithRelations = Document & {
  system: { name: string; slug: string } | null
  createdBy: { name: string | null; username: string }
}

interface DocumentListProps {
  documents: DocumentWithRelations[]
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No documents found</p>
          <Button asChild>
            <Link href="/documents/new">Create your first document</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Card key={document.id} className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">
              <Link href={`/documents/${document.id}`} className="hover:underline">
                {document.title}
              </Link>
            </CardTitle>
            <CardDescription>
              {document.system ? (
                <Link href={`/systems/${document.system.slug}`} className="hover:underline">
                  {document.system.name}
                </Link>
              ) : (
                'No system'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {document.content.slice(0, 150).replace(/[#*`]/g, '')}
              {document.content.length > 150 ? '...' : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              By {document.createdBy.name || document.createdBy.username} •{' '}
              {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
