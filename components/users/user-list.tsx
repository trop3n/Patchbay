'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUserRole, toggleUserActive, createUser, resetUserPassword } from '@/app/actions/users'
import { Shield, UserCheck, UserX, Key, Plus } from 'lucide-react'
import type { Role } from '@prisma/client'

interface User {
  id: string
  email: string
  name: string | null
  username: string
  role: Role
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

interface UserListProps {
  users: User[]
  currentUserId: string
}

const roleColors: Record<Role, string> = {
  ADMIN: 'bg-red-500',
  EDITOR: 'bg-blue-500',
  VIEWER: 'bg-gray-500',
}

const roleLabels: Record<Role, string> = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
}

export function UserList({ users, currentUserId }: UserListProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [activeDialogOpen, setActiveDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>('VIEWER')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    name: '',
    password: '',
    role: 'VIEWER' as Role,
  })

  async function handleRoleChange() {
    if (!selectedUser) return
    setIsSubmitting(true)
    const result = await updateUserRole(selectedUser.id, selectedRole)
    setIsSubmitting(false)
    if (result.success) {
      setRoleDialogOpen(false)
      setSelectedUser(null)
    } else {
      alert(result.error)
    }
  }

  async function handleToggleActive() {
    if (!selectedUser) return
    setIsSubmitting(true)
    const result = await toggleUserActive(selectedUser.id)
    setIsSubmitting(false)
    if (result.success) {
      setActiveDialogOpen(false)
      setSelectedUser(null)
    } else {
      alert(result.error)
    }
  }

  async function handleCreateUser() {
    setIsSubmitting(true)
    const result = await createUser(newUser)
    setIsSubmitting(false)
    if (result.success) {
      setCreateDialogOpen(false)
      setNewUser({ email: '', username: '', name: '', password: '', role: 'VIEWER' })
    } else {
      alert(result.error)
    }
  }

  async function handleResetPassword() {
    if (!selectedUser || !newPassword) return
    setIsSubmitting(true)
    const result = await resetUserPassword(selectedUser.id, newPassword)
    setIsSubmitting(false)
    if (result.success) {
      setResetPasswordDialogOpen(false)
      setSelectedUser(null)
      setNewPassword('')
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.name || user.username}</span>
                  <Badge variant="outline" className={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                  {user.id === currentUserId && (
                    <Badge variant="secondary">You</Badge>
                  )}
                  {!user.isActive && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUser(user)
                  setSelectedRole(user.role)
                  setRoleDialogOpen(true)
                }}
                disabled={user.id === currentUserId}
                title="Change role"
              >
                <Shield className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUser(user)
                  setResetPasswordDialogOpen(true)
                }}
                title="Reset password"
              >
                <Key className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUser(user)
                  setActiveDialogOpen(true)
                }}
                disabled={user.id === currentUserId}
                title={user.isActive ? 'Deactivate user' : 'Activate user'}
              >
                {user.isActive ? (
                  <UserX className="w-4 h-4 text-destructive" />
                ) : (
                  <UserCheck className="w-4 h-4 text-green-500" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.name || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Viewer - Read-only access</SelectItem>
                <SelectItem value="EDITOR">Editor - Can create and edit content</SelectItem>
                <SelectItem value="ADMIN">Admin - Full access including user management</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialogOpen} onOpenChange={setActiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.isActive
                ? `Deactivating ${selectedUser?.name || selectedUser?.username} will prevent them from logging in.`
                : `Activate ${selectedUser?.name || selectedUser?.username} to allow them to log in again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.isActive ? 'destructive' : 'default'}
              onClick={handleToggleActive}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : selectedUser?.isActive
                ? 'Deactivate'
                : 'Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(v) => setNewUser({ ...newUser, role: v as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isSubmitting || !newUser.email || !newUser.username || !newUser.password}
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.name || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isSubmitting || !newPassword}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
