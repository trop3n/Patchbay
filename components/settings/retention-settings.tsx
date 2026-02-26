'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'

interface RetentionSettingsProps {
  settings: {
    id: string
    name: string
    deviceLogRetentionDays: number
    statusHistoryRetentionDays: number
    alertRetentionDays: number
    resolvedAlertRetentionDays: number
    enabled: boolean
    lastCleanupAt: Date | null
  }
  stats: {
    deviceLogs: { total: number; toDelete: number }
    statusHistory: { total: number; toDelete: number }
    alerts: { total: number; toDelete: number }
    resolvedAlerts: { total: number; toDelete: number }
  }
}

export function RetentionSettings({ settings, stats }: RetentionSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    deviceLogRetentionDays: settings.deviceLogRetentionDays,
    statusHistoryRetentionDays: settings.statusHistoryRetentionDays,
    alertRetentionDays: settings.alertRetentionDays,
    resolvedAlertRetentionDays: settings.resolvedAlertRetentionDays,
    enabled: settings.enabled,
  })

  async function handleSave() {
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/retention', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    }

    setIsLoading(false)
  }

  async function handleRunCleanup() {
    setIsRunning(true)
    setMessage(null)

    try {
      const res = await fetch('/api/retention/cleanup', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Cleanup complete: ${data.stats.deviceLogsDeleted} logs, ${data.stats.statusHistoryDeleted} status records, ${data.stats.alertsDeleted + data.stats.resolvedAlertsDeleted} alerts deleted`,
        })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to run cleanup' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to run cleanup' })
    }

    setIsRunning(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Retention Policy</CardTitle>
              <CardDescription>Configure how long to keep historical data</CardDescription>
            </div>
            <Badge variant={settings.enabled ? 'default' : 'secondary'}>
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="enabled" className="font-normal cursor-pointer">
              Enable automatic cleanup
            </Label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deviceLogRetentionDays">Device Log Retention (days)</Label>
              <Input
                id="deviceLogRetentionDays"
                type="number"
                min="1"
                value={formData.deviceLogRetentionDays}
                onChange={(e) => setFormData({ ...formData, deviceLogRetentionDays: parseInt(e.target.value, 10) || 30 })}
              />
              <p className="text-xs text-muted-foreground">
                {stats.deviceLogs.total.toLocaleString()} total logs, {stats.deviceLogs.toDelete.toLocaleString()} eligible for deletion
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusHistoryRetentionDays">Status History Retention (days)</Label>
              <Input
                id="statusHistoryRetentionDays"
                type="number"
                min="1"
                value={formData.statusHistoryRetentionDays}
                onChange={(e) => setFormData({ ...formData, statusHistoryRetentionDays: parseInt(e.target.value, 10) || 90 })}
              />
              <p className="text-xs text-muted-foreground">
                {stats.statusHistory.total.toLocaleString()} total records, {stats.statusHistory.toDelete.toLocaleString()} eligible for deletion
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alertRetentionDays">Alert Retention (days)</Label>
              <Input
                id="alertRetentionDays"
                type="number"
                min="1"
                value={formData.alertRetentionDays}
                onChange={(e) => setFormData({ ...formData, alertRetentionDays: parseInt(e.target.value, 10) || 30 })}
              />
              <p className="text-xs text-muted-foreground">
                {stats.alerts.total.toLocaleString()} active alerts, {stats.alerts.toDelete.toLocaleString()} eligible for deletion
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolvedAlertRetentionDays">Resolved Alert Retention (days)</Label>
              <Input
                id="resolvedAlertRetentionDays"
                type="number"
                min="1"
                value={formData.resolvedAlertRetentionDays}
                onChange={(e) => setFormData({ ...formData, resolvedAlertRetentionDays: parseInt(e.target.value, 10) || 7 })}
              />
              <p className="text-xs text-muted-foreground">
                {stats.resolvedAlerts.total.toLocaleString()} resolved alerts, {stats.resolvedAlerts.toDelete.toLocaleString()} eligible for deletion
              </p>
            </div>
          </div>

          {settings.lastCleanupAt && (
            <p className="text-sm text-muted-foreground">
              Last cleanup: {new Date(settings.lastCleanupAt).toLocaleString()}
            </p>
          )}

          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
              {message.text}
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={handleRunCleanup} disabled={isRunning}>
              <Trash2 className="w-4 h-4 mr-2" />
              {isRunning ? 'Running...' : 'Run Cleanup Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
