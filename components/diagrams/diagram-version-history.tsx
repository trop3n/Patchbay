'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { History, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getDiagramVersion, restoreDiagramVersion } from '@/app/actions/diagrams'
import DiagramViewer from './diagram-viewer'

interface DiagramVersionHistoryProps {
  diagramId: string
  diagramType: 'SIGNAL_FLOW' | 'WHITEBOARD' | 'NETWORK' | 'RACK_LAYOUT'
  versions: Array<{
    id: string
    title: string
    createdAt: Date
    savedBy: { name: string | null; username: string }
  }>
}

export function DiagramVersionHistory({ diagramType, versions }: DiagramVersionHistoryProps) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [previewVersion, setPreviewVersion] = useState<{ id: string; data: unknown } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  async function handlePreview(versionId: string) {
    setPreviewLoading(true)
    setRestoreError(null)
    try {
      const version = await getDiagramVersion(versionId)
      if (version) {
        setPreviewVersion({ id: version.id, data: version.data })
      }
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleRestore() {
    if (!previewVersion) return
    setRestoring(true)
    setRestoreError(null)
    try {
      const result = await restoreDiagramVersion(previewVersion.id)
      if ('error' in result) {
        setRestoreError(result.error ?? null)
        return
      }
      setPreviewVersion(null)
      setSheetOpen(false)
      router.refresh()
    } finally {
      setRestoring(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setSheetOpen(true)}>
        <History className="w-4 h-4 mr-2" />
        Version History ({versions.length})
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
          </SheetHeader>

          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-6">
              No version history yet. History is recorded each time you save.
            </p>
          ) : (
            <ul className="mt-6 space-y-2">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{version.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(version.createdAt).toLocaleString()} &middot;{' '}
                      {version.savedBy.name || version.savedBy.username}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(version.id)}
                    disabled={previewLoading}
                  >
                    {previewLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Preview'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!previewVersion} onOpenChange={(open) => { if (!open) { setPreviewVersion(null); setRestoreError(null) } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Version Preview</DialogTitle>
          </DialogHeader>

          {previewVersion && (
            <DiagramViewer
              data={previewVersion.data as { nodes: unknown[]; edges: unknown[] }}
              type={diagramType}
            />
          )}

          {restoreError && (
            <p className="text-sm text-destructive">{restoreError}</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setPreviewVersion(null); setRestoreError(null) }}>
              Close
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Restore to this version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
