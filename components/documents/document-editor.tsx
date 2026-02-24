'use client'

import { MarkdownEditor } from './markdown-editor'
import { RichTextEditor } from './rich-text-editor'
import { PlainTextEditor } from './plain-text-editor'
import type { ContentTypeValue } from '@/lib/validations/document'

interface DocumentEditorProps {
  value: string
  onChange: (value: string) => void
  contentType: ContentTypeValue
  placeholder?: string
}

export function DocumentEditor({ value, onChange, contentType, placeholder }: DocumentEditorProps) {
  switch (contentType) {
    case 'RICH_TEXT':
      return (
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder || 'Start writing your document...'}
        />
      )
    case 'MARKDOWN':
      return (
        <MarkdownEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder || `# Document Title

Write your documentation in markdown...

## Features
- **Bold** and *italic* text
- Lists and checkboxes
- Code blocks
- Tables`}
        />
      )
    case 'PLAIN_TEXT':
      return (
        <PlainTextEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder || 'Start writing your document...'}
        />
      )
    default:
      return (
        <MarkdownEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )
  }
}
