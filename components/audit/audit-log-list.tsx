'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAuditLogs, getAuditLogFilterOptions, type AuditLogFilters } from '@/app/actions/audit-logs'
import { formatDistanceToNow } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  changes: Record<string, unknown> | null
  createdAt: Date
  user: {
    name: string | null
    username: string
    email: string
  }
}

interface AuditLogListProps {
  initialLogs: AuditLog[]
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-500/10 text-green-500',
  UPDATE: 'bg-blue-500/10 text-blue-500',
  DELETE: 'bg-red-500/10 text-red-500',
}

export function AuditLogList({ initialLogs }: AuditLogListProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs)
  const [filters, setFilters] = useState<AuditLogFilters>({})
  const [filterOptions, setFilterOptions] = useState<{
    actions: string[]
    entityTypes: string[]
    users: { id: string; name: string | null; username: string }[]
  } | null>(null)

  useEffect(() => {
    getAuditLogFilterOptions().then(setFilterOptions)
  }, [])

  useEffect(() => {
    getAuditLogs(filters).then((data) => setLogs(data as AuditLog[]))
  }, [filters])

  function formatChangeValue(value: unknown): string {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  function getChangesBefore(changes: Record<string, unknown> | null): Record<string, unknown> | undefined {
    if (!changes) return undefined
    return changes.before as Record<string, unknown> | undefined
  }

  function getChangesAfter(changes: Record<string, unknown> | null): Record<string, unknown> | undefined {
    if (!changes) return undefined
    return changes.after as Record<string, unknown> | undefined
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Track all changes made in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select
            value={filters.action || 'all'}
            onValueChange={(value) => setFilters({ ...filters, action: value === 'all' ? undefined : value as AuditLogFilters['action'] })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.entityType || 'all'}
            onValueChange={(value) => setFilters({ ...filters, entityType: value === 'all' ? undefined : value as AuditLogFilters['entityType'] })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="System">System</SelectItem>
              <SelectItem value="Diagram">Diagram</SelectItem>
              <SelectItem value="Document">Document</SelectItem>
              <SelectItem value="Asset">Asset</SelectItem>
              <SelectItem value="Rack">Rack</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Attachment">Attachment</SelectItem>
            </SelectContent>
          </Select>

          {filterOptions && filterOptions.users.length > 0 && (
            <Select
              value={filters.userId || 'all'}
              onValueChange={(value) => setFilters({ ...filters, userId: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {filterOptions.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No audit logs found</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={actionColors[log.action] || ''}>
                        {log.action}
                      </Badge>
                      <span className="font-medium">{log.entityType}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt))}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">by </span>
                    <span className="font-medium">{log.user.name || log.user.username}</span>
                    <span className="text-muted-foreground"> ({log.user.email})</span>
                  </div>
                  {log.changes && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-x-auto">
                      {getChangesBefore(log.changes) && (
                        <div>
                          <span className="text-red-500">- Before:</span>{' '}
                          {Object.entries(getChangesBefore(log.changes)!).map(([key, value]) => (
                            <span key={key}>{key}={formatChangeValue(value)} </span>
                          ))}
                        </div>
                      )}
                      {getChangesAfter(log.changes) && (
                        <div>
                          <span className="text-green-500">+ After:</span>{' '}
                          {Object.entries(getChangesAfter(log.changes)!).map(([key, value]) => (
                            <span key={key}>{key}={formatChangeValue(value)} </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
