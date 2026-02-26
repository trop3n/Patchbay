'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit, Trash2, CheckCircle } from 'lucide-react'
import type { AlertCondition, AlertSeverity } from '@prisma/client'

interface AlertThreshold {
  id: string
  name: string
  description: string | null
  condition: AlertCondition
  severity: AlertSeverity
  threshold: number | null
  thresholdUnit: string | null
  enabled: boolean
  notifyEmail: boolean
  notifyWebhook: boolean
  system: { id: string; name: string } | null
  device: { id: string; name: string } | null
  _count: { alerts: number }
}

interface AlertThresholdListProps {
  thresholds: AlertThreshold[]
}

const conditionLabels: Record<AlertCondition, string> = {
  DEVICE_OFFLINE: 'Device Offline',
  DEVICE_ERROR: 'Device Error',
  LOW_UPTIME: 'Low Uptime',
  STATUS_CHANGE: 'Status Change',
}

const severityColors: Record<AlertSeverity, string> = {
  INFO: 'bg-blue-500',
  WARNING: 'bg-yellow-500',
  CRITICAL: 'bg-red-500',
}

export function AlertThresholdList({ thresholds }: AlertThresholdListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setIsDeleting(true)
    const res = await fetch('/api/alerts/thresholds/' + deleteId, { method: 'DELETE' })
    if (res.ok) {
      setDeleteId(null)
      window.location.reload()
    }
    setIsDeleting(false)
  }

  if (thresholds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert Thresholds</CardTitle>
          <CardDescription>No alert thresholds configured</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create alert thresholds to get notified when devices go offline, encounter errors, or have low uptime.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {thresholds.map((threshold) => (
        <Card key={threshold.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{threshold.name}</h3>
                  <Badge variant={threshold.enabled ? 'default' : 'secondary'}>
                    {threshold.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${severityColors[threshold.severity]}`} />
                </div>
                {threshold.description && (
                  <p className="text-sm text-muted-foreground">{threshold.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Condition: {conditionLabels[threshold.condition]}</span>
                  {threshold.threshold && (
                    <span>Threshold: {threshold.threshold}{threshold.thresholdUnit === 'percent' ? '%' : ''}</span>
                  )}
                  {threshold.system && (
                    <span>System: {threshold.system.name}</span>
                  )}
                  {threshold.device && (
                    <span>Device: {threshold.device.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {threshold.notifyEmail && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle className="w-3 h-3" />
                      Email
                    </span>
                  )}
                  {threshold.notifyWebhook && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle className="w-3 h-3" />
                      Webhook
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    ({threshold._count.alerts} alerts)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Dialog open={deleteId === threshold.id} onOpenChange={(open) => setDeleteId(open ? threshold.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Alert Threshold</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete &ldquo;{threshold.name}&rdquo;? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteId(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
