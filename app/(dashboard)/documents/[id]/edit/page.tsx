import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getDocument } from '@/app/actions/documents'
import { DocumentEditForm } from '@/components/documents/document-edit-form'

interface EditDocumentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params
  const [document, systems] = await Promise.all([
    getDocument(id),
    prisma.system.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!document) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <DocumentEditForm document={document} systems={systems} />
    </div>
  )
}
