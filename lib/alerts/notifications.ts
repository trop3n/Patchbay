import { resolve } from 'dns/promises'
import { alertConfig } from './config'
import type { AlertSeverity } from './config'

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  'metadata.google.internal',
])

function isPrivateIP(hostname: string): boolean {
  // IPv4 private ranges
  const parts = hostname.split('.').map(Number)
  if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
    // 10.0.0.0/8
    if (parts[0] === 10) return true
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true
    // 169.254.0.0/16 (link-local / AWS metadata)
    if (parts[0] === 169 && parts[1] === 254) return true
    // 127.0.0.0/8
    if (parts[0] === 127) return true
    // 0.0.0.0/8
    if (parts[0] === 0) return true
  }
  return false
}

export function validateWebhookUrl(urlString: string): { valid: boolean; error?: string } {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  if (url.protocol !== 'https:') {
    return { valid: false, error: 'Webhook URL must use HTTPS' }
  }

  if (BLOCKED_HOSTNAMES.has(url.hostname)) {
    return { valid: false, error: 'Webhook URL points to a blocked host' }
  }

  if (isPrivateIP(url.hostname)) {
    return { valid: false, error: 'Webhook URL must not point to a private/internal IP address' }
  }

  // Block IPv6 addresses in brackets (e.g. https://[::1]/)
  if (url.hostname.startsWith('[')) {
    return { valid: false, error: 'Webhook URL must use a public hostname, not an IP address literal' }
  }

  // Block single-label hostnames (no dot) that could reach intranet services
  if (!url.hostname.includes('.')) {
    return { valid: false, error: 'Webhook URL must use a fully qualified domain name' }
  }

  return { valid: true }
}

async function resolveAndValidateHost(hostname: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const addresses = await resolve(hostname)
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return { valid: false, error: `Webhook hostname resolves to private IP address` }
      }
      if (BLOCKED_HOSTNAMES.has(addr)) {
        return { valid: false, error: `Webhook hostname resolves to a blocked address` }
      }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'Could not resolve webhook hostname' }
  }
}

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

  const urlCheck = validateWebhookUrl(webhookUrl)
  if (!urlCheck.valid) {
    console.error(`[Alerts] Webhook URL rejected: ${urlCheck.error}`)
    return false
  }

  const url = new URL(webhookUrl)
  const dnsCheck = await resolveAndValidateHost(url.hostname)
  if (!dnsCheck.valid) {
    console.error(`[Alerts] Webhook DNS check failed: ${dnsCheck.error}`)
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
