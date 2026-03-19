import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSystemBuild } from '@/app/actions/system-builds'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Package, User, Calendar } from 'lucide-react'
import dynamic from 'next/dynamic'
import { DeleteBuildButton } from '@/components/system-builder/delete-build-button'

const BuilderEditor = dynamic(
  () => import('@/components/system-builder/builder-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] border rounded-lg flex items-center justify-center text-muted-foreground animate-pulse bg-muted/50">
        Loading builder...
      </div>
    ),
  }
)

interface SystemBuildDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SystemBuildDetailPage({ params }: SystemBuildDetailPageProps) {
  const { id } = await params
  const build = await getSystemBuild(id)

  if (!build) {
    notFound()
  }

  const data = build.data as { nodes?: unknown[]; edges?: unknown[] } | null
  const nodes = (data?.nodes ?? []) as never[]
  const edges = (data?.edges ?? []) as never[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/system-builder">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{build.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            {nodes.length > 0 && <span>{nodes.length} devices</span>}
            {edges.length > 0 && <span>&middot; {edges.length} connections</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/system-builder/${build.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteBuildButton buildId={build.id} buildTitle={build.title} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {build.description && (
          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{build.description}</p>
            </CardContent>
          </Card>
        )}
        {build.system && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <Link href={`/systems/${build.system.id}`} className="hover:underline">
                {build.system.name}
              </Link>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created By</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{build.createdBy.name || build.createdBy.username}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(build.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <BuilderEditor
              nodes={nodes}
              edges={edges}
              onNodesChange={() => {}}
              onEdgesChange={() => {}}
              readOnly
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
