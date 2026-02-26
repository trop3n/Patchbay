import { getDashboardStats, getRecentAlerts } from '@/app/actions/dashboard'
import { DashboardStatsCards } from '@/components/dashboard/dashboard-stats-cards'
import { SystemHealthList } from '@/components/dashboard/system-health-list'
import { RecentAlerts } from '@/components/dashboard/recent-alerts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, alerts] = await Promise.all([
    getDashboardStats(),
    getRecentAlerts(10),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">System health overview and monitoring</p>
      </div>

      <DashboardStatsCards
        totalSystems={stats.totalSystems}
        totalDevices={stats.totalDevices}
        systemsOperational={stats.systemsOperational}
        systemsDegraded={stats.systemsDegraded}
        systemsOffline={stats.systemsOffline}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">System Health</h2>
            <SystemHealthList systems={stats.systemsHealth} />
          </div>
        </div>

        <div>
          <RecentAlerts alerts={alerts} />
        </div>
      </div>
    </div>
  )
}
