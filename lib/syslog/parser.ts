import type { LogLevel } from '@prisma/client'

export interface ParsedSyslogMessage {
  priority: number
  facility: number
  severity: number
  timestamp: Date | null
  hostname: string | null
  appName: string | null
  procId: string | null
  msgId: string | null
  message: string
  raw: string
}

const facilityNames = [
  'kern', 'user', 'mail', 'daemon', 'auth', 'syslog', 'lpr', 'news',
  'uucp', 'clock', 'authpriv', 'ftp', 'ntp', 'logaudit', 'logalert', 'cron',
  'local0', 'local1', 'local2', 'local3', 'local4', 'local5', 'local6', 'local7',
]

const severityToLogLevel: Record<number, LogLevel> = {
  0: 'CRITICAL',
  1: 'ERROR',
  2: 'ERROR',
  3: 'ERROR',
  4: 'WARNING',
  5: 'INFO',
  6: 'INFO',
  7: 'DEBUG',
}

export function parsePriority(priority: number): { facility: number; severity: number } {
  return {
    facility: Math.floor(priority / 8),
    severity: priority % 8,
  }
}

export function getLogLevelFromSeverity(severity: number): LogLevel {
  return severityToLogLevel[severity] || 'INFO'
}

export function parseSyslogMessage(raw: string, sourceIp?: string): ParsedSyslogMessage {
  const trimmed = raw.trim()
  
  const priorityMatch = trimmed.match(/^<(\d+)>/)
  if (!priorityMatch) {
    return {
      priority: 0,
      facility: 0,
      severity: 6,
      timestamp: null,
      hostname: sourceIp || null,
      appName: null,
      procId: null,
      msgId: null,
      message: trimmed,
      raw: trimmed,
    }
  }

  const priority = parseInt(priorityMatch[1], 10)
  const { facility, severity } = parsePriority(priority)
  const withoutPriority = trimmed.slice(priorityMatch[0].length)

  const rfc5424Match = withoutPriority.match(/^(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+([\s\S]*)$/)
  if (rfc5424Match) {
    const [, , timestampStr, hostname, appName, procId, msgId, message] = rfc5424Match
    return {
      priority,
      facility,
      severity,
      timestamp: parseTimestamp(timestampStr),
      hostname: hostname === '-' ? null : hostname,
      appName: appName === '-' ? null : appName,
      procId: procId === '-' ? null : procId,
      msgId: msgId === '-' ? null : msgId,
      message: message.trim(),
      raw: trimmed,
    }
  }

  const rfc3164Match = withoutPriority.match(/^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([\s\S]*)$/)
  if (rfc3164Match) {
    const [, timestampStr, hostname, message] = rfc3164Match
    return {
      priority,
      facility,
      severity,
      timestamp: parseRfc3164Timestamp(timestampStr),
      hostname,
      appName: null,
      procId: null,
      msgId: null,
      message: message.trim(),
      raw: trimmed,
    }
  }

  const simpleMatch = withoutPriority.match(/^(\S+)\s+([\s\S]*)$/)
  if (simpleMatch) {
    const [, hostname, message] = simpleMatch
    return {
      priority,
      facility,
      severity,
      timestamp: new Date(),
      hostname,
      appName: null,
      procId: null,
      msgId: null,
      message: message.trim(),
      raw: trimmed,
    }
  }

  return {
    priority,
    facility,
    severity,
    timestamp: new Date(),
    hostname: sourceIp || null,
    appName: null,
    procId: null,
    msgId: null,
    message: withoutPriority,
    raw: trimmed,
  }
}

function parseTimestamp(timestampStr: string): Date | null {
  try {
    const date = new Date(timestampStr)
    if (!isNaN(date.getTime())) {
      return date
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

function parseRfc3164Timestamp(timestampStr: string): Date {
  const now = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const match = timestampStr.match(/^(\w{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})$/)
  if (match) {
    const [, monthStr, day, hour, minute, second] = match
    const monthIndex = months.indexOf(monthStr)
    if (monthIndex !== -1) {
      return new Date(
        now.getFullYear(),
        monthIndex,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      )
    }
  }
  return now
}

export function getFacilityName(facility: number): string {
  return facilityNames[facility] || `facility${facility}`
}
