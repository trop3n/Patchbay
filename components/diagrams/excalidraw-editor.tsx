'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] border rounded-lg flex items-center justify-center text-muted-foreground">
        Loading editor...
      </div>
    ),
  }
)

import '@excalidraw/excalidraw/index.css'

interface ExcalidrawEditorProps {
  data: unknown
  onChange: (data: unknown) => void
}

export function ExcalidrawEditor({ data, onChange }: ExcalidrawEditorProps) {
  const [key, setKey] = useState(0)
  const [initialElements, setInitialElements] = useState<unknown[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (data && typeof data === 'object') {
      const excalidrawData = data as { elements?: unknown[] }
      setInitialElements(excalidrawData.elements || [])
      setKey((k) => k + 1)
    } else {
      setInitialElements([])
      setKey((k) => k + 1)
    }
  }, [data])

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <Excalidraw
        key={key}
        initialData={{ elements: initialElements as never[] }}
        onChange={(elements) => {
          onChange({ elements })
        }}
      />
    </div>
  )
}
