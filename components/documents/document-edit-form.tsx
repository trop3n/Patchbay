'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentEditor } from '@/components/documents/document-editor'
import { updateDocument } from '@/app/actions/documents'
import type { Document, System, ContentType } from '@prisma/client'
import type { ContentTypeValue } from '@/lib/validations/document'

interface DocumentEditFormProps {
  document: Document
  systems: Pick<System, 'id' | 'name'>[]
}

const contentTypeOptions: { value: ContentTypeValue; label: string }[] = [
  { value: 'RICH_TEXT', label: 'Rich Text' },
  { value: 'MARKDOWN', label: 'Markdown' },
  { value: 'PLAIN_TEXT', label: 'Plain Text' },
]

export function DocumentEditForm({ document, systems }: DocumentEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState(document.content)
  const [contentType, setContentType] = useState<ContentTypeValue>(
    (document.contentType as ContentTypeValue) || 'MARKDOWN'
  )
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(document.systemId || null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = await updateDocument(document.id, {
      title: formData.get('title') as string,
      content,
      contentType,
      systemId: selectedSystemId,
    })

    if (result.success) {
      router.push(`/documents/${document.id}`)
    } else {
      setError(result.error || 'Failed to update document')
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Edit Document</CardTitle>
        <CardDescription>Update document content</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="System Overview"
                defaultValue={document.title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(v) => setContentType(v as ContentTypeValue)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system">Associated System</Label>
            <Select
              value={selectedSystemId || '__none__'}
              onValueChange={(v) => setSelectedSystemId(v === '__none__' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a system (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <DocumentEditor
              value={content}
              onChange={setContent}
              contentType={contentType}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
