'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent } from '@/components/ui/card'
import type { ContentTypeValue } from '@/lib/validations/document'

interface DocumentViewerProps {
  content: string
  contentType: ContentTypeValue
}

export function DocumentViewer({ content, contentType }: DocumentViewerProps) {
  if (!content) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground italic">No content</p>
        </CardContent>
      </Card>
    )
  }

  switch (contentType) {
    case 'RICH_TEXT':
      return (
        <Card>
          <CardContent 
            className="prose prose-sm dark:prose-invert max-w-none pt-6"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Card>
      )
    case 'MARKDOWN':
      return (
        <Card>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )
    case 'PLAIN_TEXT':
      return (
        <Card>
          <CardContent className="pt-6">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
              {content}
            </pre>
          </CardContent>
        </Card>
      )
    default:
      return (
        <Card>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )
  }
}
