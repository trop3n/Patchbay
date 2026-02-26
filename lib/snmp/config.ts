export const snmpConfig = {
  defaultPort: parseInt(process.env.SNMP_DEFAULT_PORT || '161', 10),
  defaultCommunity: process.env.SNMP_DEFAULT_COMMUNITY || 'public',
  defaultVersion: (process.env.SNMP_DEFAULT_VERSION || '2c') as '1' | '2c' | '3',
  timeout: parseInt(process.env.SNMP_TIMEOUT || '5000', 10),
  retries: parseInt(process.env.SNMP_RETRIES || '2', 10),
  pollIntervalMs: parseInt(process.env.SNMP_POLL_INTERVAL || '60000', 10),
}

export const standardOids = {
  sysDescr: '1.3.6.1.2.1.1.1.0',
  sysUpTime: '1.3.6.1.2.1.1.3.0',
  sysName: '1.3.6.1.2.1.1.5.0',
  sysContact: '1.3.6.1.2.1.1.4.0',
  sysLocation: '1.3.6.1.2.1.1.6.0',
  ifNumber: '1.3.6.1.2.1.2.1.0',
}
