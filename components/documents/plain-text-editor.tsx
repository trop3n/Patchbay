'use client'

import { Textarea } from '@/components/ui/textarea'

interface PlainTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PlainTextEditor({ value, onChange, placeholder }: PlainTextEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[400px] font-mono text-sm resize-y"
    />
  )
}
