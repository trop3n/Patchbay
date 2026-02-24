'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { uploadAttachment } from '@/app/actions/attachments'
import { Upload, X } from 'lucide-react'

interface AttachmentUploadProps {
  systemId?: string
  documentId?: string
  onUploaded?: () => void
}

export function AttachmentUpload({ systemId, documentId, onUploaded }: AttachmentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  function handleClear() {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleUpload() {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    if (systemId) formData.append('systemId', systemId)
    if (documentId) formData.append('documentId', documentId)

    const result = await uploadAttachment(formData)

    setIsUploading(false)

    if ('success' in result && result.success) {
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onUploaded?.()
    } else if ('error' in result) {
      setError(result.error)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.zip"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Select File
        </Button>
        {selectedFile && (
          <>
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {selectedFile.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Allowed: PDF, Word, Excel, Text, CSV, Images (JPEG, PNG, GIF, WebP), ZIP. Max 50MB.
      </p>
    </div>
  )
}
