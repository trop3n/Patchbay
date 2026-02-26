import { prisma } from '../lib/prisma'
import { runRetentionCleanup, getRetentionPolicy } from '../lib/retention'

async function main() {
  console.log('[Retention] Starting retention cleanup job...')
  
  const policy = await getRetentionPolicy()
  console.log('[Retention] Current policy:', {
    enabled: policy.enabled,
    deviceLogDays: policy.deviceLogRetentionDays,
    statusHistoryDays: policy.statusHistoryRetentionDays,
    alertDays: policy.alertRetentionDays,
    resolvedAlertDays: policy.resolvedAlertRetentionDays,
    lastCleanup: policy.lastCleanupAt,
  })

  if (!policy.enabled) {
    console.log('[Retention] Cleanup is disabled, exiting')
    return
  }

  const stats = await runRetentionCleanup()
  
  console.log('[Retention] Cleanup summary:')
  console.log(`  - Device logs deleted: ${stats.deviceLogsDeleted}`)
  console.log(`  - Status history deleted: ${stats.statusHistoryDeleted}`)
  console.log(`  - Alerts deleted: ${stats.alertsDeleted}`)
  console.log(`  - Resolved alerts deleted: ${stats.resolvedAlertsDeleted}`)
  console.log(`  - Run completed at: ${stats.runAt.toISOString()}`)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[Retention] Fatal error:', error)
  process.exit(1)
})
