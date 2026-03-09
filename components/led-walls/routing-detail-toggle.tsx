'use client'

import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface RoutingDetailToggleProps {
  showPorts: boolean
  onToggle: () => void
}

export function RoutingDetailToggle({ showPorts, onToggle }: RoutingDetailToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      {showPorts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      {showPorts ? 'Simple View' : 'Port Detail'}
    </Button>
  )
}
