export const alertConfig = {
  emailFrom: process.env.ALERT_EMAIL_FROM || 'alerts@patchbay.local',
  emailEnabled: process.env.ALERT_EMAIL_ENABLED === 'true',
  smtpHost: process.env.SMTP_HOST || 'localhost',
  smtpPort: parseInt(process.env.SMTP_PORT || '25', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  webhookTimeout: parseInt(process.env.ALERT_WEBHOOK_TIMEOUT || '10000', 10),
  cooldownMinutes: parseInt(process.env.ALERT_COOLDOWN_MINUTES || '15', 10),
}

export type AlertCondition = 'DEVICE_OFFLINE' | 'DEVICE_ERROR' | 'LOW_UPTIME' | 'STATUS_CHANGE'
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'

export const conditionLabels: Record<AlertCondition, string> = {
  DEVICE_OFFLINE: 'Device Offline',
  DEVICE_ERROR: 'Device Error',
  LOW_UPTIME: 'Low Uptime',
  STATUS_CHANGE: 'Status Change',
}

export const severityLabels: Record<AlertSeverity, string> = {
  INFO: 'Info',
  WARNING: 'Warning',
  CRITICAL: 'Critical',
}
