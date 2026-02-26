import { alertConfig } from './config'
import type { AlertSeverity } from './config'

interface AlertNotification {
  thresholdName: string
  condition: string
  severity: AlertSeverity
  message: string
  deviceName?: string
  systemName?: string
  timestamp: Date
}

export async function sendEmailNotification(
  recipients: string[],
  notification: AlertNotification
): Promise<boolean> {
  if (!alertConfig.emailEnabled || recipients.length === 0) {
    return false
  }

  const subject = `[${notification.severity}] ${notification.thresholdName}: ${notification.message}`

  const body = `
Alert: ${notification.thresholdName}
Condition: ${notification.condition}
Severity: ${notification.severity}
${notification.deviceName ? `Device: ${notification.deviceName}` : ''}
${notification.systemName ? `System: ${notification.systemName}` : ''}
Message: ${notification.message}
Time: ${notification.timestamp.toISOString()}
  `.trim()

  console.log(`[Alerts] Email notification to ${recipients.join(', ')}: ${subject}`)
  console.log(`[Alerts] Email body:\n${body}`)

  return true
}

export async function sendWebhookNotification(
  webhookUrl: string,
  notification: AlertNotification
): Promise<boolean> {
  if (!webhookUrl) {
    return false
  }

  const payload = {
    alert: {
      threshold: notification.thresholdName,
      condition: notification.condition,
      severity: notification.severity,
      message: notification.message,
      device: notification.deviceName,
      system: notification.systemName,
      timestamp: notification.timestamp.toISOString(),
    },
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(alertConfig.webhookTimeout),
    })

    if (!response.ok) {
      console.error(`[Alerts] Webhook failed: ${response.status} ${response.statusText}`)
      return false
    }

    console.log(`[Alerts] Webhook notification sent to ${webhookUrl}`)
    return true
  } catch (error) {
    console.error('[Alerts] Webhook error:', error)
    return false
  }
}

export async function sendNotifications(
  notification: AlertNotification,
  options: {
    notifyEmail?: boolean
    notifyWebhook?: boolean
    emailRecipients?: string | null
    webhookUrl?: string | null
  }
): Promise<void> {
  const promises: Promise<unknown>[] = []

  if (options.notifyEmail && options.emailRecipients) {
    const recipients = options.emailRecipients
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    if (recipients.length > 0) {
      promises.push(sendEmailNotification(recipients, notification))
    }
  }

  if (options.notifyWebhook && options.webhookUrl) {
    promises.push(sendWebhookNotification(options.webhookUrl, notification))
  }

  await Promise.allSettled(promises)
}
