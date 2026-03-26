import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSystemSelectOptions } from '@/app/actions/systems'
import { getRack } from '@/app/actions/racks'
import { RackEditForm } from '@/components/racks/rack-edit-form'

interface EditRackPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRackPage({ params }: EditRackPageProps) {
  const { id } = await params
  const [rack, systems, assets] = await Promise.all([
    getRack(id),
    getSystemSelectOptions(),
    prisma.asset.findMany({
      select: { id: true, name: true, manufacturer: true, model: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!rack) {
    notFound()
  }

  return (
    <div className="h-full">
      <RackEditForm rack={rack} systems={systems} assets={assets} />
    </div>
  )
}
