'use client'

import { useState } from 'react'
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
import { deleteAttachment } from '@/app/actions/attachments'
import { formatFileSize } from '@/lib/file-utils'
import { Paperclip, Download, Trash2, FileText, Image, File } from 'lucide-react'

interface Attachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  createdAt: Date
  createdBy: {
    name: string | null
    username: string
  }
}

interface AttachmentListProps {
  attachments: Attachment[]
  canDelete?: boolean
  onDeleted?: () => void
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType === 'application/pdf') return FileText
  return File
}

export function AttachmentList({ attachments, canDelete = false, onDeleted }: AttachmentListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleDownload(id: string) {
    window.open(`/api/attachments/${id}`, '_blank')
  }

  async function handleDelete() {
    if (!deleteId) return
    
    setIsDeleting(true)
    const result = await deleteAttachment(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
    
    if (result.success) {
      onDeleted?.()
    }
  }

  if (attachments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2 py-4">
        <Paperclip className="w-4 h-4" />
        No attachments
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.mimeType)
        return (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{attachment.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)} · {new Date(attachment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment.id)}
              >
                <Download className="w-4 h-4" />
              </Button>
              {canDelete && (
                <Dialog open={deleteId === attachment.id} onOpenChange={(open) => setDeleteId(open ? attachment.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Attachment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete &quot;{attachment.originalName}&quot;? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteId(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
