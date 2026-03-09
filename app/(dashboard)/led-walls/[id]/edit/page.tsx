import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getLedWall } from '@/app/actions/led-walls'
import { LedWallEditForm } from '@/components/led-walls/led-wall-edit-form'

interface EditLedWallPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLedWallPage({ params }: EditLedWallPageProps) {
  const { id } = await params
  const [ledWall, systems] = await Promise.all([
    getLedWall(id),
    prisma.system.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!ledWall) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <LedWallEditForm ledWall={ledWall} systems={systems} />
    </div>
  )
}
