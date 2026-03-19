import { getSystemBuilds } from '@/app/actions/system-builds'
import { SystemBuildList } from '@/components/system-builder/system-build-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SystemBuilderPage() {
  const builds = await getSystemBuilds()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Builder</h1>
          <p className="text-muted-foreground">Hardware signal flow and system layouts</p>
        </div>
        <Button asChild>
          <Link href="/system-builder/new">
            <Plus className="w-4 h-4 mr-2" />
            New Build
          </Link>
        </Button>
      </div>
      <SystemBuildList builds={builds} />
    </div>
  )
}
