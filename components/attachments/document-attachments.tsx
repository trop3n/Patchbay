'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttachmentList, AttachmentUpload } from '@/components/attachments'
import { getAttachments } from '@/app/actions/attachments'

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

interface DocumentAttachmentsProps {
  documentId: string
  initialAttachments: Attachment[]
  canDelete?: boolean
}

export function DocumentAttachments({ documentId, initialAttachments, canDelete = false }: DocumentAttachmentsProps) {
  const [attachments, setAttachments] = useState(initialAttachments)

  async function refreshAttachments() {
    const data = await getAttachments({ documentId })
    setAttachments(data as Attachment[])
  }

  useEffect(() => {
    setAttachments(initialAttachments)
  }, [initialAttachments])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AttachmentUpload documentId={documentId} onUploaded={refreshAttachments} />
        <AttachmentList
          attachments={attachments}
          canDelete={canDelete}
          onDeleted={refreshAttachments}
        />
      </CardContent>
    </Card>
  )
}
