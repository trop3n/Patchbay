import {
  Monitor,
  Camera,
  Tv2,
  Projector,
  LayoutGrid,
  ArrowLeftRight,
  Scaling,
  Upload,
  Download,
  Mic,
  Radio,
  Speaker,
  AudioLines,
  SlidersHorizontal,
  Volume2,
  Gamepad2,
  Tablet,
  Cpu,
  Network,
  Router,
  Wifi,
  Server,
  BatteryCharging,
  PlugZap,
  RectangleHorizontal,
  Rows3,
  Tag,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type HardwareCategory = 'video' | 'audio' | 'control' | 'network' | 'power' | 'generic'

export interface HardwareType {
  id: string
  label: string
  category: HardwareCategory
  icon: LucideIcon
  defaultSpecs?: string[]
}

export const categoryColors: Record<HardwareCategory, string> = {
  video: '#3b82f6',
  audio: '#22c55e',
  control: '#a855f7',
  network: '#f97316',
  power: '#10b981',
  generic: '#71717a',
}

export const categoryLabels: Record<HardwareCategory, string> = {
  video: 'Video',
  audio: 'Audio',
  control: 'Control',
  network: 'Network',
  power: 'Power',
  generic: 'Generic',
}

export const hardwareTypes: HardwareType[] = [
  { id: 'video-source', label: 'Video Source', category: 'video', icon: Monitor, defaultSpecs: ['HDMI', '4K'] },
  { id: 'camera', label: 'Camera', category: 'video', icon: Camera, defaultSpecs: ['SDI', '1080p'] },
  { id: 'display', label: 'Display', category: 'video', icon: Tv2, defaultSpecs: ['HDMI', '4K'] },
  { id: 'projector', label: 'Projector', category: 'video', icon: Projector, defaultSpecs: ['HDMI', 'HDBaseT'] },
  { id: 'led-wall', label: 'LED Wall', category: 'video', icon: LayoutGrid, defaultSpecs: ['LED', 'P2.5'] },
  { id: 'switcher', label: 'Switcher', category: 'video', icon: ArrowLeftRight, defaultSpecs: ['4x1', 'HDMI'] },
  { id: 'scaler', label: 'Scaler', category: 'video', icon: Scaling, defaultSpecs: ['4K', 'HDCP'] },
  { id: 'encoder', label: 'Encoder', category: 'video', icon: Upload, defaultSpecs: ['NDI', 'H.264'] },
  { id: 'decoder', label: 'Decoder', category: 'video', icon: Download, defaultSpecs: ['NDI', 'H.264'] },

  { id: 'microphone', label: 'Microphone', category: 'audio', icon: Mic, defaultSpecs: ['XLR', 'Condenser'] },
  { id: 'wireless-mic', label: 'Wireless Mic', category: 'audio', icon: Radio, defaultSpecs: ['UHF', 'Digital'] },
  { id: 'speaker', label: 'Speaker', category: 'audio', icon: Speaker, defaultSpecs: ['Powered', 'Dante'] },
  { id: 'dsp', label: 'DSP', category: 'audio', icon: AudioLines, defaultSpecs: ['Dante', '64ch'] },
  { id: 'mixer', label: 'Mixer', category: 'audio', icon: SlidersHorizontal, defaultSpecs: ['Digital', '32ch'] },
  { id: 'amplifier', label: 'Amplifier', category: 'audio', icon: Volume2, defaultSpecs: ['2ch', '500W'] },

  { id: 'controller', label: 'Controller', category: 'control', icon: Gamepad2, defaultSpecs: ['IP', 'RS-232'] },
  { id: 'touch-panel', label: 'Touch Panel', category: 'control', icon: Tablet, defaultSpecs: ['10"', 'PoE'] },
  { id: 'control-system', label: 'Control System', category: 'control', icon: Cpu, defaultSpecs: ['Crestron', 'IP'] },

  { id: 'switch', label: 'Switch', category: 'network', icon: Network, defaultSpecs: ['PoE+', '24-port'] },
  { id: 'router', label: 'Router', category: 'network', icon: Router, defaultSpecs: ['1G', 'Managed'] },
  { id: 'wifi-ap', label: 'WiFi AP', category: 'network', icon: Wifi, defaultSpecs: ['WiFi 6', 'PoE'] },
  { id: 'server', label: 'Server', category: 'network', icon: Server, defaultSpecs: ['1U', 'x86'] },

  { id: 'ups', label: 'UPS', category: 'power', icon: BatteryCharging, defaultSpecs: ['1500VA', 'Online'] },
  { id: 'pdu', label: 'PDU', category: 'power', icon: PlugZap, defaultSpecs: ['Managed', '20A'] },

  { id: 'rack', label: 'Rack', category: 'generic', icon: RectangleHorizontal, defaultSpecs: ['42U'] },
  { id: 'patch-panel', label: 'Patch Panel', category: 'generic', icon: Rows3, defaultSpecs: ['24-port', 'Cat6'] },
  { id: 'label', label: 'Label', category: 'generic', icon: Tag, defaultSpecs: [] },
]

export function getHardwareType(id: string): HardwareType | undefined {
  return hardwareTypes.find((t) => t.id === id)
}

export function getHardwareByCategory(category: HardwareCategory): HardwareType[] {
  return hardwareTypes.filter((t) => t.category === category)
}

export const allCategories: HardwareCategory[] = ['video', 'audio', 'control', 'network', 'power', 'generic']
