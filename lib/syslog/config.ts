export const syslogConfig = {
  udpPort: parseInt(process.env.SYSLOG_UDP_PORT || '514', 10),
  tcpPort: parseInt(process.env.SYSLOG_TCP_PORT || '514', 10),
  host: process.env.SYSLOG_HOST || '0.0.0.0',
  bufferSize: parseInt(process.env.SYSLOG_BUFFER_SIZE || '65536', 10),
  enableUdp: process.env.SYSLOG_ENABLE_UDP !== 'false',
  enableTcp: process.env.SYSLOG_ENABLE_TCP !== 'false',
}
