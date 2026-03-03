import { getDashboardStats, getRecentAlerts } from '@/app/actions/dashboard'
import { StatusBoard } from '@/components/status/status-board'

export default async function StatusPage() {
  const [stats, alerts] = await Promise.all([
    getDashboardStats(),
    getRecentAlerts(10),
  ])

  return <StatusBoard stats={stats} alerts={alerts} />
}
