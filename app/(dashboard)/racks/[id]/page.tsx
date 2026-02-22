import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRack } from '@/app/actions/racks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, MapPin, Package, User, Calendar } from 'lucide-react'
import { DeleteRackButton } from '@/components/racks/delete-rack-button'
import type { RackUnit } from '@/app/actions/racks'

interface RackDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RackDetailPage({ params }: RackDetailPageProps) {
  const { id } = await params
  const rack = await getRack(id)

  if (!rack) {
    notFound()
  }

  const units = (rack.units as { units?: RackUnit[] })?.units || []
  const usedUnits = units.reduce((sum, u) => sum + u.height, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/racks">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{rack.name}</h1>
          <p className="text-muted-foreground">
            {rack.height}U Rack • {units.length} items • {usedUnits}U used
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/racks/${rack.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteRackButton rackId={rack.id} rackName={rack.name} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {rack.location && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{rack.location}</span>
            </CardContent>
          </Card>
        )}
        {rack.system && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <Link href={`/systems/${rack.system.id}`} className="hover:underline">
                {rack.system.name}
              </Link>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span>{usedUnits}U / {rack.height}U</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min((usedUnits / rack.height) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created By</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{rack.createdBy.name || rack.createdBy.username}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(rack.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Rack Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex">
            <div className="flex flex-col border rounded-l-lg overflow-hidden">
              {Array.from({ length: rack.height }, (_, i) => rack.height - i).map((pos) => {
                const unitAtPos = units.find((u) => {
                  const end = u.position + u.height - 1
                  return pos >= u.position && pos <= end
                })
                if (unitAtPos && unitAtPos.position !== pos) {
                  return null
                }
                return (
                  <div
                    key={pos}
                    className="h-10 w-10 flex items-center justify-center text-xs text-muted-foreground bg-muted/50 border-b last:border-b-0"
                  >
                    {unitAtPos ? '' : pos}
                  </div>
                )
              })}
            </div>
            <div className="flex-1 border border-l-0 rounded-r-lg overflow-hidden">
              {Array.from({ length: rack.height }, (_, i) => rack.height - i).map((pos) => {
                const unit = units.find((u) => u.position === pos)
                if (unit) {
                  const heightPx = unit.height * 40
                  return (
                    <div
                      key={pos}
                      className="border-b last:border-b-0 bg-blue-500/10 border-blue-500/30 flex items-center px-3 gap-2"
                      style={{ height: `${heightPx}px` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{unit.label || 'Unnamed'}</p>
                        {(unit.manufacturer || unit.model) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {unit.manufacturer} {unit.model}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{unit.height}U</span>
                    </div>
                  )
                }
                const isOccupied = units.some((u) => {
                  const end = u.position + u.height - 1
                  return pos >= u.position && pos <= end
                })
                if (!isOccupied) {
                  return (
                    <div
                      key={pos}
                      className="h-10 border-b last:border-b-0 bg-background"
                    />
                  )
                }
                return null
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
