import { prisma } from '@/lib/prisma'
import { LedWallForm } from '@/components/led-walls/led-wall-form'

export const dynamic = 'force-dynamic'

export default async function NewLedWallPage() {
  const systems = await prisma.system.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <LedWallForm systems={systems} />
    </div>
  )
}
