import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAsset } from '@/app/actions/assets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, MapPin, Calendar, User, Package, Tag, Wrench, FileText } from 'lucide-react'
import { DeleteAssetButton } from '@/components/assets/delete-asset-button'

interface AssetDetailPageProps {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500',
  IN_STORAGE: 'bg-blue-500',
  IN_REPAIR: 'bg-yellow-500',
  RETIRED: 'bg-gray-500',
  LOST: 'bg-red-500',
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  IN_STORAGE: 'In Storage',
  IN_REPAIR: 'In Repair',
  RETIRED: 'Retired',
  LOST: 'Lost',
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params
  const asset = await getAsset(id)

  if (!asset) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/assets">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{asset.name}</h1>
            <div className={`w-3 h-3 rounded-full ${statusColors[asset.status]}`} title={statusLabels[asset.status]} />
          </div>
          {asset.manufacturer && asset.model && (
            <p className="text-muted-foreground">{asset.manufacturer} {asset.model}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/assets/${asset.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {asset.serialNumber && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Serial Number</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">{asset.serialNumber}</span>
            </CardContent>
          </Card>
        )}
        {asset.location && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{asset.location}</span>
            </CardContent>
          </Card>
        )}
        {asset.system && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <Link href={`/systems/${asset.system.id}`} className="hover:underline">
                {asset.system.name}
              </Link>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[asset.status]}`} />
            <span>{statusLabels[asset.status]}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created By</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{asset.createdBy.name || asset.createdBy.username}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
      </div>

      {(asset.purchaseDate || asset.warrantyEnd) && (
        <>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            {asset.purchaseDate && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Purchase Date</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                </CardContent>
              </Card>
            )}
            {asset.warrantyEnd && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Warranty End</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(asset.warrantyEnd).toLocaleDateString()}</span>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {asset.notes && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{asset.notes}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
