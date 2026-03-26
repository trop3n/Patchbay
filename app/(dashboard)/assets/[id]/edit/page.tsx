import { notFound } from 'next/navigation'
import { getSystemSelectOptions } from '@/app/actions/systems'
import { getAsset } from '@/app/actions/assets'
import { AssetEditForm } from '@/components/assets/asset-edit-form'

interface EditAssetPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const { id } = await params
  const [asset, systems] = await Promise.all([
    getAsset(id),
    getSystemSelectOptions(),
  ])

  if (!asset) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <AssetEditForm asset={asset} systems={systems} />
    </div>
  )
}
