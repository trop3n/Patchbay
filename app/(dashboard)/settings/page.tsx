import { auth } from '@/lib/auth'
import { getUsers } from '@/app/actions/users'
import { getAuditLogs } from '@/app/actions/audit-logs'
import { getAlertThresholds } from '@/app/actions/alerts'
import { UserList } from '@/components/users/user-list'
import { AuditLogList } from '@/components/audit/audit-log-list'
import { AlertThresholdList } from '@/components/alerts/alert-threshold-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Shield, User, FileText, Bell, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface UserInfo {
  id: string
  email: string
  name: string | null
  username: string
  role: Role
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

interface AuditLogItem {
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

export default async function SettingsPage() {
  const session = await auth()
  if (!session) {
    return null
  }

  const isAdmin = session.user.role === 'ADMIN'
  const isEditor = session.user.role === 'EDITOR'
  let users: UserInfo[] = []
  let auditLogs: Awaited<ReturnType<typeof getAuditLogs>> = []
  let alertThresholds: Awaited<ReturnType<typeof getAlertThresholds>> = []

  if (isAdmin) {
    users = await getUsers()
    auditLogs = await getAuditLogs()
  }

  if (isAdmin || isEditor) {
    alertThresholds = await getAlertThresholds()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account" className="gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          {(isAdmin || isEditor) && (
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="w-4 h-4" />
              Alert Thresholds
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="users" className="gap-2">
              <Shield className="w-4 h-4" />
              User Management
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="w-4 h-4" />
              Audit Logs
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <p className="text-sm font-medium">Username</p>
                <p className="text-sm text-muted-foreground">{session.user.username}</p>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{session.user.name || 'Not set'}</p>
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-medium">Role</p>
                <p className="text-sm text-muted-foreground">{session.user.role}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(isAdmin || isEditor) && (
          <TabsContent value="alerts">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button asChild>
                  <Link href="/settings/alerts/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Threshold
                  </Link>
                </Button>
              </div>
              <AlertThresholdList thresholds={alertThresholds} />
            </div>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="users">
            <UserList users={users} currentUserId={session.user.id} />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="audit">
            <AuditLogList initialLogs={auditLogs as unknown as AuditLogItem[]} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
