'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportSystems, exportDevices, exportAssets } from '@/app/actions/csv'

interface CsvExportButtonProps {
  entityType: 'systems' | 'devices' | 'assets'
}

export function CsvExportButton({ entityType }: CsvExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      let csv: string
      if (entityType === 'systems') {
        csv = await exportSystems()
      } else if (entityType === 'devices') {
        csv = await exportDevices()
      } else {
        csv = await exportAssets()
      }

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `${entityType}-${new Date().toISOString().slice(0, 10)}.csv`,
      })
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download className="w-4 h-4 mr-2" />
      {loading ? 'Exporting…' : 'Export CSV'}
    </Button>
  )
}
