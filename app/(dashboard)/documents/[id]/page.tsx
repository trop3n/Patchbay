import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDocument } from '@/app/actions/documents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Calendar, User, Folder, FileText } from 'lucide-react'
import { DeleteDocumentButton } from '@/components/documents/delete-document-button'
import { DocumentViewer } from '@/components/documents/document-viewer'
import type { ContentType } from '@prisma/client'

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>
}

const contentTypeLabels: Record<ContentType, string> = {
  RICH_TEXT: 'Rich Text',
  MARKDOWN: 'Markdown',
  PLAIN_TEXT: 'Plain Text',
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params
  const document = await getDocument(id)

  if (!document) {
    notFound()
  }

  const contentType = (document.contentType as ContentType) || 'MARKDOWN'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/documents">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{document.title}</h1>
            <Badge variant="secondary">{contentTypeLabels[contentType]}</Badge>
          </div>
          {document.system && (
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Folder className="w-4 h-4" />
              <Link href={`/systems/${document.system.id}`} className="hover:underline">
                {document.system.name}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/documents/${document.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteDocumentButton documentId={document.id} documentTitle={document.title} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created By</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{document.createdBy.name || document.createdBy.username}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(document.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <DocumentViewer content={document.content} contentType={contentType} />
    </div>
  )
}
