'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] border rounded-lg flex items-center justify-center text-muted-foreground">
        Loading diagram...
      </div>
    ),
  }
)

import '@excalidraw/excalidraw/index.css'

interface ExcalidrawViewerProps {
  data: unknown
}

export function ExcalidrawViewer({ data }: ExcalidrawViewerProps) {
  const [key, setKey] = useState(0)
  const [initialElements, setInitialElements] = useState<unknown[] | null>(null)

  useEffect(() => {
    if (data && typeof data === 'object') {
      const excalidrawData = data as { elements?: unknown[] }
      setInitialElements(excalidrawData.elements || [])
      setKey((k) => k + 1)
    } else {
      setInitialElements([])
      setKey((k) => k + 1)
    }
  }, [data])

  if (initialElements === null) {
    return (
      <div className="h-[400px] border rounded-lg flex items-center justify-center text-muted-foreground">
        Loading diagram...
      </div>
    )
  }

  if (!initialElements.length) {
    return (
      <div className="h-[400px] border rounded-lg flex items-center justify-center text-muted-foreground">
        No diagram data
      </div>
    )
  }

  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <Excalidraw
        key={key}
        initialData={{ elements: initialElements as never[] }}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: false,
            saveToActiveFile: false,
          },
        }}
        viewModeEnabled
        zenModeEnabled
      />
    </div>
  )
}
