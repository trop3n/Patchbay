'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import sanitizeHtml from 'sanitize-html'
import { Card, CardContent } from '@/components/ui/card'
import type { ContentTypeValue } from '@/lib/validations/document'

interface DocumentViewerProps {
  content: string
  contentType: ContentTypeValue
}

// Content is sanitized via sanitize-html before rendering to prevent stored XSS
export function DocumentViewer({ content, contentType }: DocumentViewerProps) {
  const sanitizedContent = useMemo(() => {
    if (contentType === 'RICH_TEXT' && content) {
      return sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'u', 's', 'sub', 'sup']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height'],
          a: ['href', 'target', 'rel'],
          '*': ['class', 'style'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
      })
    }
    return content
  }, [content, contentType])

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
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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
