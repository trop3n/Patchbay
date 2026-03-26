import { notFound } from 'next/navigation'
import { getSystemSelectOptions } from '@/app/actions/systems'
import { getSystemBuild } from '@/app/actions/system-builds'
import { SystemBuildEditForm } from '@/components/system-builder/system-build-edit-form'

interface EditSystemBuildPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSystemBuildPage({ params }: EditSystemBuildPageProps) {
  const { id } = await params
  const [build, systems] = await Promise.all([
    getSystemBuild(id),
    getSystemSelectOptions(),
  ])

  if (!build) {
    notFound()
  }

  return (
    <div className="h-full">
      <SystemBuildEditForm build={build} systems={systems} />
    </div>
  )
}
