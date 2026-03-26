import { getSystemSelectOptions } from '@/app/actions/systems'
import { AssetForm } from '@/components/assets/asset-form'

export const dynamic = 'force-dynamic'

export default async function NewAssetPage() {
  const systems = await getSystemSelectOptions()

  return (
    <div className="space-y-6">
      <AssetForm systems={systems} />
    </div>
  )
}
