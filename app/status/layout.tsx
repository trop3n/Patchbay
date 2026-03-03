import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DeviceStatusProvider } from '@/components/providers/device-status-provider'

export default async function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <DeviceStatusProvider>
        {children}
      </DeviceStatusProvider>
    </div>
  )
}
