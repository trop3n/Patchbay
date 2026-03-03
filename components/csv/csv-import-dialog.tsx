'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { importSystems, importDevices, importAssets } from '@/app/actions/csv'

interface CsvImportDialogProps {
  entityType: 'systems' | 'devices' | 'assets'
}

type Step = 'upload' | 'preview' | 'importing' | 'result'

const TEMPLATE_HEADERS: Record<CsvImportDialogProps['entityType'], string[]> = {
  systems: ['name', 'slug', 'description', 'location', 'category', 'status'],
  devices: [
    'name', 'systemSlug', 'ipAddress', 'macAddress', 'deviceType',
    'manufacturer', 'model', 'status', 'snmpEnabled', 'snmpVersion',
    'snmpCommunity', 'snmpPort',
  ],
  assets: [
    'name', 'serialNumber', 'manufacturer', 'model', 'purchaseDate',
    'warrantyEnd', 'location', 'status', 'notes', 'systemSlug',
  ],
}

const ENTITY_LABELS: Record<CsvImportDialogProps['entityType'], string> = {
  systems: 'Systems',
  devices: 'Devices',
  assets: 'Assets',
}

export function CsvImportDialog({ entityType }: CsvImportDialogProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('upload')
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null)

  const headers = TEMPLATE_HEADERS[entityType]
  const label = ENTITY_LABELS[entityType]

  function resetDialog() {
    setStep('upload')
    setRows([])
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetDialog()
    setOpen(next)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        setRows(results.data)
        setStep('preview')
      },
    })
  }

  function downloadTemplate() {
    const csv = Papa.unparse({ fields: headers, data: [] })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `${entityType}-template.csv`,
    })
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport() {
    setStep('importing')

    let res: { created: number; errors: string[] }
    if (entityType === 'systems') {
      res = await importSystems(rows)
    } else if (entityType === 'devices') {
      res = await importDevices(rows)
    } else {
      res = await importAssets(rows)
    }

    setResult(res)
    setStep('result')
    if (res.created > 0) {
      router.refresh()
    }
  }

  const previewRows = rows.slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        {step === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle>Import {label}</DialogTitle>
              <DialogDescription>
                Upload a CSV file to bulk-import {label.toLowerCase()}. Download the template to see the expected format.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button onClick={() => fileInputRef.current?.click()} size="lg">
                <Upload className="w-4 h-4 mr-2" />
                Choose CSV file
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                Download Template
              </Button>
            </div>
          </>
        )}

        {step === 'preview' && (
          <>
            <DialogHeader>
              <DialogTitle>Preview Import</DialogTitle>
              <DialogDescription>
                {rows.length} row{rows.length !== 1 ? 's' : ''} found.
                {rows.length > 10 && ' Showing first 10.'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-72 rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      {headers.map((h) => (
                        <TableCell key={h} className="max-w-[120px] truncate text-xs">
                          {row[h] ?? ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={resetDialog}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Import {rows.length} row{rows.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'importing' && (
          <>
            <DialogHeader>
              <DialogTitle>Importing…</DialogTitle>
              <DialogDescription>
                Please wait while your data is being imported.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </>
        )}

        {step === 'result' && result && (
          <>
            <DialogHeader>
              <DialogTitle>Import Complete</DialogTitle>
              <DialogDescription>
                {result.created} created, {result.errors.length} failed
              </DialogDescription>
            </DialogHeader>
            {result.errors.length > 0 && (
              <ScrollArea className="max-h-48 rounded border bg-muted p-3">
                <ul className="space-y-1 text-sm text-destructive">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
