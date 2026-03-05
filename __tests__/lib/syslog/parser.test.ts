import {
  parsePriority,
  getLogLevelFromSeverity,
  getFacilityName,
  parseSyslogMessage,
} from '@/lib/syslog/parser'

describe('parsePriority', () => {
  it('extracts facility and severity from priority value', () => {
    expect(parsePriority(134)).toEqual({ facility: 16, severity: 6 })
  })

  it('handles priority 0', () => {
    expect(parsePriority(0)).toEqual({ facility: 0, severity: 0 })
  })

  it('handles kernel emergency (priority 0)', () => {
    expect(parsePriority(0)).toEqual({ facility: 0, severity: 0 })
  })

  it('handles auth notice (priority 37)', () => {
    expect(parsePriority(37)).toEqual({ facility: 4, severity: 5 })
  })
})

describe('getLogLevelFromSeverity', () => {
  it('maps severity 0 (Emergency) to CRITICAL', () => {
    expect(getLogLevelFromSeverity(0)).toBe('CRITICAL')
  })

  it('maps severity 1-3 (Alert/Critical/Error) to ERROR', () => {
    expect(getLogLevelFromSeverity(1)).toBe('ERROR')
    expect(getLogLevelFromSeverity(2)).toBe('ERROR')
    expect(getLogLevelFromSeverity(3)).toBe('ERROR')
  })

  it('maps severity 4 (Warning) to WARNING', () => {
    expect(getLogLevelFromSeverity(4)).toBe('WARNING')
  })

  it('maps severity 5-6 (Notice/Info) to INFO', () => {
    expect(getLogLevelFromSeverity(5)).toBe('INFO')
    expect(getLogLevelFromSeverity(6)).toBe('INFO')
  })

  it('maps severity 7 (Debug) to DEBUG', () => {
    expect(getLogLevelFromSeverity(7)).toBe('DEBUG')
  })

  it('defaults to INFO for unknown severity', () => {
    expect(getLogLevelFromSeverity(99)).toBe('INFO')
  })
})

describe('getFacilityName', () => {
  it('maps known facility numbers to names', () => {
    expect(getFacilityName(0)).toBe('kern')
    expect(getFacilityName(1)).toBe('user')
    expect(getFacilityName(4)).toBe('auth')
    expect(getFacilityName(16)).toBe('local0')
    expect(getFacilityName(23)).toBe('local7')
  })

  it('returns fallback for unknown facility numbers', () => {
    expect(getFacilityName(24)).toBe('facility24')
    expect(getFacilityName(100)).toBe('facility100')
  })
})

describe('parseSyslogMessage', () => {
  it('parses RFC 5424 format', () => {
    const raw = '<134>1 2024-01-15T10:30:00Z myhost myapp 1234 ID47 Test message'
    const result = parseSyslogMessage(raw)

    expect(result.priority).toBe(134)
    expect(result.facility).toBe(16)
    expect(result.severity).toBe(6)
    expect(result.hostname).toBe('myhost')
    expect(result.appName).toBe('myapp')
    expect(result.procId).toBe('1234')
    expect(result.msgId).toBe('ID47')
    expect(result.message).toBe('Test message')
    expect(result.raw).toBe(raw)
  })

  it('parses RFC 5424 with nil values as null', () => {
    const raw = '<134>1 2024-01-15T10:30:00Z - - - - Test message'
    const result = parseSyslogMessage(raw)

    expect(result.hostname).toBeNull()
    expect(result.appName).toBeNull()
    expect(result.procId).toBeNull()
    expect(result.msgId).toBeNull()
  })

  it('parses RFC 3164 format', () => {
    const raw = '<134>Jan 15 10:30:00 myhost sshd[1234]: Failed password'
    const result = parseSyslogMessage(raw)

    expect(result.priority).toBe(134)
    expect(result.facility).toBe(16)
    expect(result.severity).toBe(6)
    expect(result.hostname).toBe('myhost')
    expect(result.message).toBe('sshd[1234]: Failed password')
    expect(result.timestamp).toBeInstanceOf(Date)
  })

  it('handles messages without priority', () => {
    const raw = 'Just a plain message'
    const result = parseSyslogMessage(raw)

    expect(result.priority).toBe(0)
    expect(result.facility).toBe(0)
    expect(result.severity).toBe(6)
    expect(result.message).toBe('Just a plain message')
  })

  it('handles messages without priority with sourceIp', () => {
    const raw = 'Just a plain message'
    const result = parseSyslogMessage(raw, '192.168.1.1')

    expect(result.hostname).toBe('192.168.1.1')
  })

  it('falls back gracefully for malformed input', () => {
    const raw = '<13>some message without proper format'
    const result = parseSyslogMessage(raw)

    expect(result.priority).toBe(13)
    expect(result.message).toContain('message without proper format')
    expect(result.raw).toBe(raw)
  })

  it('handles empty-ish input', () => {
    const raw = '  '
    const result = parseSyslogMessage(raw)

    expect(result.message).toBe('')
    expect(result.priority).toBe(0)
  })
})
