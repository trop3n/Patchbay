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
import { MarkdownEditor } from '@/components/documents/markdown-editor'
import { updateDocument } from '@/app/actions/documents'
import type { Document, System } from '@prisma/client'

interface DocumentEditFormProps {
  document: Document
  systems: Pick<System, 'id' | 'name'>[]
}

export function DocumentEditForm({ document, systems }: DocumentEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState(document.content)
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(document.systemId || null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    
    const result = await updateDocument(document.id, {
      title: formData.get('title') as string,
      content,
      systemId: selectedSystemId || undefined,
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
            <Label htmlFor="system">Associated System</Label>
            <Select 
              value={selectedSystemId || ''} 
              onValueChange={(v) => setSelectedSystemId(v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a system (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
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
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Write your documentation in markdown..."
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
