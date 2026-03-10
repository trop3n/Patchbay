import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLedWall } from '@/app/actions/led-walls'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, Package, User, Calendar } from 'lucide-react'
import dynamic from 'next/dynamic'
import { DeleteLedWallButton } from '@/components/led-walls/delete-led-wall-button'
import type { Node, Edge } from '@xyflow/react'

const LedWallDetailView = dynamic(
  () => import('@/components/led-walls/led-wall-detail-view'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] border rounded-lg flex items-center justify-center text-muted-foreground animate-pulse bg-muted/50">
        Loading layout...
      </div>
    ),
  }
)

interface LedWallDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function LedWallDetailPage({ params }: LedWallDetailPageProps) {
  const { id } = await params
  const ledWall = await getLedWall(id)

  if (!ledWall) {
    notFound()
  }

  const data = ledWall.data as { nodes?: Node[]; edges?: Edge[] } | null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/led-walls">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ledWall.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={ledWall.type === 'VIDEO_WALL' ? 'default' : 'secondary'}>
              {ledWall.type === 'VIDEO_WALL' ? 'Video Wall' : 'Strip Layout'}
            </Badge>
            {data?.nodes && <span className="text-muted-foreground">{data.nodes.length} items</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/led-walls/${ledWall.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteLedWallButton ledWallId={ledWall.id} ledWallName={ledWall.name} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ledWall.description && (
          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{ledWall.description}</p>
            </CardContent>
          </Card>
        )}
        {ledWall.system && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <Link href={`/systems/${ledWall.system.id}`} className="hover:underline">
                {ledWall.system.name}
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
            <span>{ledWall.createdBy.name || ledWall.createdBy.username}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(ledWall.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <LedWallDetailView data={data} />
        </CardContent>
      </Card>
    </div>
  )
}
