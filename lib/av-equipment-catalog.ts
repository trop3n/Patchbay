export type EquipmentCategory =
  | 'video-switcher'
  | 'video-scaler'
  | 'video-distribution'
  | 'video-streaming'
  | 'video-router'
  | 'production-switcher'
  | 'camera'
  | 'camera-controller'
  | 'audio-dsp'
  | 'audio-mixer'
  | 'audio-amplifier'
  | 'audio-io'
  | 'network-switch'
  | 'control-system'
  | 'wireless-presentation'
  | 'signal-extension'
  | 'power'
  | 'patch-panel'
  | 'accessory'

export interface AvEquipmentSpec {
  id: string
  brand: string
  model: string
  category: EquipmentCategory
  rackUnits: number
  description: string
  halfRack?: boolean
}

export const categoryLabels: Record<EquipmentCategory, string> = {
  'video-switcher': 'Video Switchers',
  'video-scaler': 'Video Scalers & Processors',
  'video-distribution': 'Video Distribution',
  'video-streaming': 'Video Streaming & Recording',
  'video-router': 'Video Routers',
  'production-switcher': 'Production Switchers',
  'camera': 'Cameras',
  'camera-controller': 'Camera Controllers',
  'audio-dsp': 'Audio DSP & Processing',
  'audio-mixer': 'Audio Mixers',
  'audio-amplifier': 'Audio Amplifiers',
  'audio-io': 'Audio I/O',
  'network-switch': 'Network Switches',
  'control-system': 'Control Systems',
  'wireless-presentation': 'Wireless Presentation',
  'signal-extension': 'Signal Extension',
  'power': 'Power',
  'patch-panel': 'Patch Panels',
  'accessory': 'Accessories',
}

export const avEquipmentCatalog: AvEquipmentSpec[] = [
  // ── Extron: Video Switchers ──────────────────────────────────
  {
    id: 'extron-in1808',
    brand: 'Extron',
    model: 'IN1808',
    category: 'video-switcher',
    rackUnits: 1,
    description: '8-input HDMI/analog scaling presentation switcher',
  },
  {
    id: 'extron-in1804',
    brand: 'Extron',
    model: 'IN1804',
    category: 'video-switcher',
    rackUnits: 1,
    description: '4-input HDMI/analog scaling presentation switcher',
  },
  {
    id: 'extron-in1608',
    brand: 'Extron',
    model: 'IN1608',
    category: 'video-switcher',
    rackUnits: 2,
    description: '8-input scaling presentation switcher with DTP',
  },
  {
    id: 'extron-smp351',
    brand: 'Extron',
    model: 'SMP 351',
    category: 'video-streaming',
    rackUnits: 1,
    description: 'H.264 streaming media processor',
  },
  {
    id: 'extron-sme211',
    brand: 'Extron',
    model: 'SME 211',
    category: 'video-streaming',
    rackUnits: 1,
    description: 'H.264 streaming media encoder',
    halfRack: true,
  },
  {
    id: 'extron-dtp-crosspoint-84',
    brand: 'Extron',
    model: 'DTP CrossPoint 84',
    category: 'video-switcher',
    rackUnits: 2,
    description: '8x4 4K scaling matrix switcher with DTP extension',
  },
  {
    id: 'extron-dtp-crosspoint-108',
    brand: 'Extron',
    model: 'DTP CrossPoint 108',
    category: 'video-switcher',
    rackUnits: 3,
    description: '10x8 4K scaling matrix switcher with DTP extension',
  },
  {
    id: 'extron-crosspoint-84',
    brand: 'Extron',
    model: 'CrossPoint 84 4K',
    category: 'video-switcher',
    rackUnits: 1,
    description: '8x4 4K HDMI matrix switcher',
  },
  {
    id: 'extron-sw4-hdmi',
    brand: 'Extron',
    model: 'SW4 HD 4K PLUS',
    category: 'video-switcher',
    rackUnits: 1,
    description: '4-input 4K/60 HDMI switcher',
    halfRack: true,
  },
  {
    id: 'extron-sw6-hdmi',
    brand: 'Extron',
    model: 'SW6 HD 4K PLUS',
    category: 'video-switcher',
    rackUnits: 1,
    description: '6-input 4K/60 HDMI switcher',
  },
  {
    id: 'extron-sw8-hdmi',
    brand: 'Extron',
    model: 'SW8 HD 4K PLUS',
    category: 'video-switcher',
    rackUnits: 1,
    description: '8-input 4K/60 HDMI switcher',
  },

  // ── Extron: Video Scalers & Processors ───────────────────────
  {
    id: 'extron-dsc301hd',
    brand: 'Extron',
    model: 'DSC 301 HD',
    category: 'video-scaler',
    rackUnits: 1,
    description: '3-input 4K scaler with seamless switching',
    halfRack: true,
  },
  {
    id: 'extron-dsc-hd-4ki',
    brand: 'Extron',
    model: 'DSC HD 4K PLUS',
    category: 'video-scaler',
    rackUnits: 1,
    description: '4K HDMI scaler',
    halfRack: true,
  },
  {
    id: 'extron-vsc700',
    brand: 'Extron',
    model: 'VSC 700',
    category: 'video-scaler',
    rackUnits: 1,
    description: 'High-performance video and RGB scaler',
  },

  // ── Extron: Video Distribution ───────────────────────────────
  {
    id: 'extron-hdmi-da2-4k',
    brand: 'Extron',
    model: 'HDMI DA2 4K PLUS',
    category: 'video-distribution',
    rackUnits: 1,
    description: '1x2 4K HDMI distribution amplifier',
    halfRack: true,
  },
  {
    id: 'extron-hdmi-da4-4k',
    brand: 'Extron',
    model: 'HDMI DA4 4K PLUS',
    category: 'video-distribution',
    rackUnits: 1,
    description: '1x4 4K HDMI distribution amplifier',
    halfRack: true,
  },
  {
    id: 'extron-hdmi-da6-4k',
    brand: 'Extron',
    model: 'HDMI DA6 4K PLUS',
    category: 'video-distribution',
    rackUnits: 1,
    description: '1x6 4K HDMI distribution amplifier',
  },
  {
    id: 'extron-hdmi-da8-4k',
    brand: 'Extron',
    model: 'HDMI DA8 4K PLUS',
    category: 'video-distribution',
    rackUnits: 1,
    description: '1x8 4K HDMI distribution amplifier',
  },
  {
    id: 'extron-dtp-hdmi-330-tx',
    brand: 'Extron',
    model: 'DTP HDMI 4K 330 Tx',
    category: 'signal-extension',
    rackUnits: 1,
    description: 'DTP transmitter for HDMI over CATx',
    halfRack: true,
  },
  {
    id: 'extron-dtp-hdmi-330-rx',
    brand: 'Extron',
    model: 'DTP HDMI 4K 330 Rx',
    category: 'signal-extension',
    rackUnits: 1,
    description: 'DTP receiver for HDMI over CATx',
    halfRack: true,
  },
  {
    id: 'extron-nax-avbridge',
    brand: 'Extron',
    model: 'NAV AVBridge',
    category: 'video-streaming',
    rackUnits: 1,
    description: 'AV-over-IP encoder/decoder bridge',
    halfRack: true,
  },
  {
    id: 'extron-smp-111',
    brand: 'Extron',
    model: 'SMP 111',
    category: 'video-streaming',
    rackUnits: 1,
    description: 'Compact H.264 streaming media processor',
    halfRack: true,
  },

  // ── Extron: Audio ────────────────────────────────────────────
  {
    id: 'extron-dmp128',
    brand: 'Extron',
    model: 'DMP 128',
    category: 'audio-dsp',
    rackUnits: 1,
    description: '12x8 ProDSP digital matrix processor',
  },
  {
    id: 'extron-dmp128plus',
    brand: 'Extron',
    model: 'DMP 128 Plus',
    category: 'audio-dsp',
    rackUnits: 1,
    description: '12x8 ProDSP with AEC and Dante',
  },
  {
    id: 'extron-dmp64',
    brand: 'Extron',
    model: 'DMP 64',
    category: 'audio-dsp',
    rackUnits: 1,
    description: '6x4 ProDSP digital matrix processor',
    halfRack: true,
  },
  {
    id: 'extron-xpa2002',
    brand: 'Extron',
    model: 'XPA 2002',
    category: 'audio-amplifier',
    rackUnits: 1,
    description: '2-channel 200W power amplifier',
  },
  {
    id: 'extron-xpa2004',
    brand: 'Extron',
    model: 'XPA 2004',
    category: 'audio-amplifier',
    rackUnits: 2,
    description: '4-channel 200W power amplifier',
  },

  // ── Extron: Control ──────────────────────────────────────────
  {
    id: 'extron-ipcp-pro-550',
    brand: 'Extron',
    model: 'IPCP Pro 550',
    category: 'control-system',
    rackUnits: 1,
    description: 'IP Link Pro control processor',
  },
  {
    id: 'extron-ipcp-pro-360',
    brand: 'Extron',
    model: 'IPCP Pro 360',
    category: 'control-system',
    rackUnits: 1,
    description: 'IP Link Pro control processor',
    halfRack: true,
  },
  {
    id: 'extron-ipcp-pro-250',
    brand: 'Extron',
    model: 'IPCP Pro 250',
    category: 'control-system',
    rackUnits: 1,
    description: 'Compact IP Link Pro control processor',
    halfRack: true,
  },

  // ── Extron: Power ────────────────────────────────────────────
  {
    id: 'extron-ipl-pro-s1',
    brand: 'Extron',
    model: 'IPL Pro S1',
    category: 'power',
    rackUnits: 1,
    description: 'IP Link Pro power controller',
    halfRack: true,
  },
  {
    id: 'extron-ps124',
    brand: 'Extron',
    model: 'PS 124',
    category: 'power',
    rackUnits: 1,
    description: '12V 4A rack mount power supply',
    halfRack: true,
  },

  // ── Q-SYS: Audio DSP ────────────────────────────────────────
  {
    id: 'qsys-core-110f',
    brand: 'Q-SYS',
    model: 'Core 110f',
    category: 'audio-dsp',
    rackUnits: 1,
    description: 'Q-SYS network audio DSP core, 128 channels',
  },
  {
    id: 'qsys-core-nano',
    brand: 'Q-SYS',
    model: 'Core Nano',
    category: 'audio-dsp',
    rackUnits: 1,
    description: 'Compact Q-SYS DSP core, 64 channels',
    halfRack: true,
  },
  {
    id: 'qsys-core-510i',
    brand: 'Q-SYS',
    model: 'Core 510i',
    category: 'audio-dsp',
    rackUnits: 2,
    description: 'Q-SYS integrated core with 32 analog I/O',
  },
  {
    id: 'qsys-core-5200',
    brand: 'Q-SYS',
    model: 'Core 5200',
    category: 'audio-dsp',
    rackUnits: 2,
    description: 'Enterprise Q-SYS core, 512 channels',
  },
  {
    id: 'qsys-io-8flex',
    brand: 'Q-SYS',
    model: 'I/O-8 Flex',
    category: 'audio-io',
    rackUnits: 1,
    description: '8-channel configurable analog I/O',
    halfRack: true,
  },
  {
    id: 'qsys-io-usb-bridge',
    brand: 'Q-SYS',
    model: 'I/O USB Bridge',
    category: 'audio-io',
    rackUnits: 1,
    description: 'USB audio I/O for Q-SYS network',
    halfRack: true,
  },
  {
    id: 'qsys-cxd-4.2',
    brand: 'Q-SYS',
    model: 'CX-Qn 4K2',
    category: 'audio-amplifier',
    rackUnits: 1,
    description: '4-channel 250W network amplifier',
  },
  {
    id: 'qsys-cxd-4.5',
    brand: 'Q-SYS',
    model: 'CX-Qn 4K5',
    category: 'audio-amplifier',
    rackUnits: 2,
    description: '4-channel 500W network amplifier',
  },
  {
    id: 'qsys-nv-32-h',
    brand: 'Q-SYS',
    model: 'NV-32-H',
    category: 'video-streaming',
    rackUnits: 1,
    description: 'Network video endpoint, HDMI I/O',
    halfRack: true,
  },

  // ── Cisco: Network Switches ──────────────────────────────────
  {
    id: 'cisco-c9200l-24p',
    brand: 'Cisco',
    model: 'Catalyst 9200L-24P',
    category: 'network-switch',
    rackUnits: 1,
    description: '24-port PoE+ Gigabit managed switch',
  },
  {
    id: 'cisco-c9200l-48p',
    brand: 'Cisco',
    model: 'Catalyst 9200L-48P',
    category: 'network-switch',
    rackUnits: 1,
    description: '48-port PoE+ Gigabit managed switch',
  },
  {
    id: 'cisco-c9200-24t',
    brand: 'Cisco',
    model: 'Catalyst 9200-24T',
    category: 'network-switch',
    rackUnits: 1,
    description: '24-port Gigabit managed switch',
  },
  {
    id: 'cisco-c9200-48t',
    brand: 'Cisco',
    model: 'Catalyst 9200-48T',
    category: 'network-switch',
    rackUnits: 1,
    description: '48-port Gigabit managed switch',
  },
  {
    id: 'cisco-c9300-24t',
    brand: 'Cisco',
    model: 'Catalyst 9300-24T',
    category: 'network-switch',
    rackUnits: 1,
    description: '24-port Gigabit stackable managed switch',
  },
  {
    id: 'cisco-c9300-48p',
    brand: 'Cisco',
    model: 'Catalyst 9300-48P',
    category: 'network-switch',
    rackUnits: 1,
    description: '48-port PoE+ stackable managed switch',
  },
  {
    id: 'cisco-c9300l-24p',
    brand: 'Cisco',
    model: 'Catalyst 9300L-24P',
    category: 'network-switch',
    rackUnits: 1,
    description: '24-port PoE+ Gigabit essentials switch',
  },
  {
    id: 'cisco-sg350-28p',
    brand: 'Cisco',
    model: 'SG350-28P',
    category: 'network-switch',
    rackUnits: 1,
    description: '28-port PoE Gigabit managed switch',
  },
  {
    id: 'cisco-sg350-52p',
    brand: 'Cisco',
    model: 'SG350-52P',
    category: 'network-switch',
    rackUnits: 1,
    description: '52-port PoE Gigabit managed switch',
  },

  // ── Zyxel: Network Switches ──────────────────────────────────
  {
    id: 'zyxel-gs1920-24hp',
    brand: 'Zyxel',
    model: 'GS1920-24HPv2',
    category: 'network-switch',
    rackUnits: 1,
    description: '24-port PoE Gigabit smart managed switch',
  },
  {
    id: 'zyxel-gs1920-48hp',
    brand: 'Zyxel',
    model: 'GS1920-48HPv2',
    category: 'network-switch',
    rackUnits: 1,
    description: '48-port PoE Gigabit smart managed switch',
  },
  {
    id: 'zyxel-xgs1930-28hp',
    brand: 'Zyxel',
    model: 'XGS1930-28HP',
    category: 'network-switch',
    rackUnits: 1,
    description: '24-port PoE 10G smart managed switch',
  },
  {
    id: 'zyxel-xgs1930-52hp',
    brand: 'Zyxel',
    model: 'XGS1930-52HP',
    category: 'network-switch',
    rackUnits: 1,
    description: '48-port PoE 10G smart managed switch',
  },
  {
    id: 'zyxel-xgs2220-30hp',
    brand: 'Zyxel',
    model: 'XGS2220-30HP',
    category: 'network-switch',
    rackUnits: 1,
    description: '24-port PoE L3 access switch with 10G uplinks',
  },
  {
    id: 'zyxel-gs1900-24hp',
    brand: 'Zyxel',
    model: 'GS1900-24HP',
    category: 'network-switch',
    rackUnits: 1,
    description: '24-port PoE Gigabit smart switch',
  },
  {
    id: 'zyxel-gs1900-8hp',
    brand: 'Zyxel',
    model: 'GS1900-8HP',
    category: 'network-switch',
    rackUnits: 1,
    description: '8-port PoE Gigabit smart switch',
    halfRack: true,
  },

  // ── Crestron: Wireless Presentation ──────────────────────────
  {
    id: 'crestron-am-3200',
    brand: 'Crestron',
    model: 'AirMedia AM-3200',
    category: 'wireless-presentation',
    rackUnits: 1,
    description: 'AirMedia wireless presentation with 4K and AEC',
    halfRack: true,
  },
  {
    id: 'crestron-am-3200-wf',
    brand: 'Crestron',
    model: 'AirMedia AM-3200-WF',
    category: 'wireless-presentation',
    rackUnits: 1,
    description: 'AirMedia with Wi-Fi connectivity',
    halfRack: true,
  },
  {
    id: 'crestron-am-3100',
    brand: 'Crestron',
    model: 'AirMedia AM-3100',
    category: 'wireless-presentation',
    rackUnits: 1,
    description: 'AirMedia receiver with HDMI output',
    halfRack: true,
  },

  // ── Bittree: Video Routers / Patch Panels ────────────────────
  {
    id: 'bittree-b96dc-fnait',
    brand: 'Bittree',
    model: 'B96DC-FNAIT',
    category: 'patch-panel',
    rackUnits: 2,
    description: '2x48 audio patch panel, front-access, normals',
  },
  {
    id: 'bittree-b64s-2mwthd',
    brand: 'Bittree',
    model: 'B64S-2MWTHD',
    category: 'video-router',
    rackUnits: 1,
    description: '64-point 12G-SDI video patchbay, 2x32',
  },
  {
    id: 'bittree-b32s-2mwthd',
    brand: 'Bittree',
    model: 'B32S-2MWTHD',
    category: 'video-router',
    rackUnits: 1,
    description: '32-point 12G-SDI video patchbay, 2x16',
  },
  {
    id: 'bittree-b96dc-fnplt',
    brand: 'Bittree',
    model: 'B96DC-FNPLT',
    category: 'patch-panel',
    rackUnits: 2,
    description: '2x48 audio patch panel, programmable',
  },
  {
    id: 'bittree-b48s-2mwthd',
    brand: 'Bittree',
    model: 'B48S-2MWTHD',
    category: 'video-router',
    rackUnits: 1,
    description: '48-point 12G-SDI video patchbay, 2x24',
  },
  {
    id: 'bittree-ps4825f',
    brand: 'Bittree',
    model: 'PS4825F',
    category: 'patch-panel',
    rackUnits: 1,
    description: '48-port Cat6 Ethernet patch panel',
  },

  // ── Panasonic: PTZ Cameras ───────────────────────────────────
  {
    id: 'panasonic-aw-ue150',
    brand: 'Panasonic',
    model: 'AW-UE150',
    category: 'camera',
    rackUnits: 0,
    description: '4K 60p PTZ camera with 20x optical zoom',
  },
  {
    id: 'panasonic-aw-ue100',
    brand: 'Panasonic',
    model: 'AW-UE100',
    category: 'camera',
    rackUnits: 0,
    description: '4K NDI PTZ camera with 24x optical zoom',
  },
  {
    id: 'panasonic-aw-ue80',
    brand: 'Panasonic',
    model: 'AW-UE80',
    category: 'camera',
    rackUnits: 0,
    description: '4K PTZ camera with 24x optical zoom',
  },
  {
    id: 'panasonic-aw-ue50',
    brand: 'Panasonic',
    model: 'AW-UE50',
    category: 'camera',
    rackUnits: 0,
    description: '4K PTZ camera with 24x zoom, wide angle',
  },
  {
    id: 'panasonic-aw-ue40',
    brand: 'Panasonic',
    model: 'AW-UE40',
    category: 'camera',
    rackUnits: 0,
    description: '4K PTZ camera with 24x zoom, compact',
  },
  {
    id: 'panasonic-aw-he145',
    brand: 'Panasonic',
    model: 'AW-HE145',
    category: 'camera',
    rackUnits: 0,
    description: 'Full HD PTZ camera with 20x optical zoom',
  },
  {
    id: 'panasonic-aw-he75',
    brand: 'Panasonic',
    model: 'AW-HE75',
    category: 'camera',
    rackUnits: 0,
    description: 'Full HD PTZ camera, compact indoor',
  },

  // ── Panasonic: PTZ Controllers ───────────────────────────────
  {
    id: 'panasonic-aw-rp150',
    brand: 'Panasonic',
    model: 'AW-RP150',
    category: 'camera-controller',
    rackUnits: 0,
    description: 'PTZ camera controller with touchscreen, up to 200 cameras',
  },
  {
    id: 'panasonic-aw-rp60',
    brand: 'Panasonic',
    model: 'AW-RP60',
    category: 'camera-controller',
    rackUnits: 0,
    description: 'Compact PTZ camera controller with joystick',
  },
  {
    id: 'panasonic-aw-rp50',
    brand: 'Panasonic',
    model: 'AW-RP50',
    category: 'camera-controller',
    rackUnits: 0,
    description: 'PTZ camera controller with LCD touch panel',
  },

  // ── Ross: Production Switchers ───────────────────────────────
  {
    id: 'ross-carbonite-black-solo',
    brand: 'Ross',
    model: 'Carbonite Black Solo',
    category: 'production-switcher',
    rackUnits: 1,
    description: '6-input compact production switcher',
  },
  {
    id: 'ross-carbonite-black-plus',
    brand: 'Ross',
    model: 'Carbonite Black Plus',
    category: 'production-switcher',
    rackUnits: 2,
    description: '12-input 2 M/E production switcher',
  },
  {
    id: 'ross-carbonite-black-2m',
    brand: 'Ross',
    model: 'Carbonite Black 2M/E',
    category: 'production-switcher',
    rackUnits: 4,
    description: '24-input 2 M/E production switcher',
  },
  {
    id: 'ross-carbonite-ultra',
    brand: 'Ross',
    model: 'Carbonite Ultra',
    category: 'production-switcher',
    rackUnits: 4,
    description: 'High-end 4K production switcher',
  },
  {
    id: 'ross-pmc-solo',
    brand: 'Ross',
    model: 'Carbonite Black Solo Panel',
    category: 'production-switcher',
    rackUnits: 0,
    description: 'Control panel for Carbonite Black Solo',
  },

  // ── Generic / Common ─────────────────────────────────────────
  {
    id: 'generic-1u-blank',
    brand: 'Generic',
    model: '1U Blank Panel',
    category: 'accessory',
    rackUnits: 1,
    description: '1U rack blank filler panel',
  },
  {
    id: 'generic-2u-blank',
    brand: 'Generic',
    model: '2U Blank Panel',
    category: 'accessory',
    rackUnits: 2,
    description: '2U rack blank filler panel',
  },
  {
    id: 'generic-1u-shelf',
    brand: 'Generic',
    model: '1U Rack Shelf',
    category: 'accessory',
    rackUnits: 1,
    description: '1U vented cantilever rack shelf',
  },
  {
    id: 'generic-2u-shelf',
    brand: 'Generic',
    model: '2U Rack Shelf',
    category: 'accessory',
    rackUnits: 2,
    description: '2U vented rack shelf with adjustable depth',
  },
  {
    id: 'generic-4u-drawer',
    brand: 'Generic',
    model: '4U Rack Drawer',
    category: 'accessory',
    rackUnits: 4,
    description: '4U sliding rack-mount storage drawer',
  },
  {
    id: 'generic-1u-pdu',
    brand: 'Generic',
    model: '1U PDU - 8 Outlet',
    category: 'power',
    rackUnits: 1,
    description: '1U rack-mount power distribution unit, 8 outlets',
  },
  {
    id: 'generic-1u-ups',
    brand: 'Generic',
    model: '1U UPS 1500VA',
    category: 'power',
    rackUnits: 1,
    description: '1U rack-mount UPS, 1500VA/900W',
  },
  {
    id: 'generic-2u-ups',
    brand: 'Generic',
    model: '2U UPS 3000VA',
    category: 'power',
    rackUnits: 2,
    description: '2U rack-mount UPS, 3000VA/2700W',
  },
  {
    id: 'generic-24-cat6-patch',
    brand: 'Generic',
    model: '24-Port Cat6 Patch Panel',
    category: 'patch-panel',
    rackUnits: 1,
    description: '24-port Cat6 RJ45 patch panel',
  },
  {
    id: 'generic-48-cat6-patch',
    brand: 'Generic',
    model: '48-Port Cat6 Patch Panel',
    category: 'patch-panel',
    rackUnits: 2,
    description: '48-port Cat6 RJ45 patch panel',
  },
]

export function getCategories(): EquipmentCategory[] {
  return [...new Set(avEquipmentCatalog.map((e) => e.category))]
}

export function getBrands(): string[] {
  return [...new Set(avEquipmentCatalog.map((e) => e.brand))].sort()
}

export function getEquipmentByCategory(category: EquipmentCategory): AvEquipmentSpec[] {
  return avEquipmentCatalog.filter((e) => e.category === category)
}

export function getEquipmentByBrand(brand: string): AvEquipmentSpec[] {
  return avEquipmentCatalog.filter((e) => e.brand === brand)
}

export function searchEquipment(query: string): AvEquipmentSpec[] {
  const q = query.toLowerCase()
  return avEquipmentCatalog.filter((e) =>
    e.brand.toLowerCase().includes(q) ||
    e.model.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q) ||
    categoryLabels[e.category].toLowerCase().includes(q)
  )
}
