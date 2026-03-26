import { getSystemSelectOptions } from '@/app/actions/systems'
import { DocumentForm } from '@/components/documents/document-form'

export const dynamic = 'force-dynamic'

export default async function NewDocumentPage() {
  const systems = await getSystemSelectOptions()

  return (
    <div className="space-y-6">
      <DocumentForm systems={systems} />
    </div>
  )
}
