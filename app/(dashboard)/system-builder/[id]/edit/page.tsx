import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSystemBuild } from '@/app/actions/system-builds'
import { SystemBuildEditForm } from '@/components/system-builder/system-build-edit-form'

interface EditSystemBuildPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSystemBuildPage({ params }: EditSystemBuildPageProps) {
  const { id } = await params
  const [build, systems] = await Promise.all([
    getSystemBuild(id),
    prisma.system.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
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
