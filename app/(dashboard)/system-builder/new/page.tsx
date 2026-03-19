import { prisma } from '@/lib/prisma'
import { SystemBuildForm } from '@/components/system-builder/system-build-form'

export const dynamic = 'force-dynamic'

export default async function NewSystemBuildPage() {
  const systems = await prisma.system.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="h-full">
      <SystemBuildForm systems={systems} />
    </div>
  )
}
