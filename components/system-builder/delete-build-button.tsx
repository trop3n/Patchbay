'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteSystemBuild } from '@/app/actions/system-builds'

interface DeleteBuildButtonProps {
  buildId: string
  buildTitle: string
}

export function DeleteBuildButton({ buildId, buildTitle }: DeleteBuildButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(open: boolean) {
    setIsOpen(open)
    if (!open) setError(null)
  }

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteSystemBuild(buildId)

      if (result.success) {
        router.push('/system-builder')
        return
      }

      setError(result.error ?? 'Failed to delete build')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete build')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete System Build</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{buildTitle}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
