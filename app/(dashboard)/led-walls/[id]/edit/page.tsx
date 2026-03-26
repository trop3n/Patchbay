import { notFound } from 'next/navigation'
import { getSystemSelectOptions } from '@/app/actions/systems'
import { getLedWall } from '@/app/actions/led-walls'
import { LedWallEditForm } from '@/components/led-walls/led-wall-edit-form'

interface EditLedWallPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLedWallPage({ params }: EditLedWallPageProps) {
  const { id } = await params
  const [ledWall, systems] = await Promise.all([
    getLedWall(id),
    getSystemSelectOptions(),
  ])

  if (!ledWall) {
    notFound()
  }

  return (
    <div className="h-full">
      <LedWallEditForm ledWall={ledWall} systems={systems} />
    </div>
  )
}
