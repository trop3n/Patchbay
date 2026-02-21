import { prisma } from '@/lib/prisma'
import { DocumentForm } from '@/components/documents/document-form'

export const dynamic = 'force-dynamic'

export default async function NewDocumentPage() {
  const systems = await prisma.system.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <DocumentForm systems={systems} />
    </div>
  )
}
