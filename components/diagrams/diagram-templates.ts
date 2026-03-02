import type { Node, Edge } from '@xyflow/react'

export interface DiagramTemplate {
  id: string
  name: string
  description: string
  type: 'SIGNAL_FLOW' | 'NETWORK' | 'RACK_LAYOUT'
  nodes: Node[]
  edges: Edge[]
}

const createNode = (
  id: string,
  type: string,
  label: string,
  icon: string,
  position: { x: number; y: number }
): Node => ({
  id,
  type: 'avNode',
  position,
  data: { label, nodeType: type, icon },
})

const createEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
})

export const diagramTemplates: DiagramTemplate[] = [
  {
    id: 'conference-room',
    name: 'Conference Room',
    description: 'Basic video conferencing setup with display, camera, and audio',
    type: 'SIGNAL_FLOW',
    nodes: [
      createNode('laptop', 'videoSource', 'Laptop', '💻', { x: 50, y: 50 }),
      createNode('camera', 'videoSource', 'PTZ Camera', '📹', { x: 50, y: 150 }),
      createNode('codec', 'processor', 'Video Codec', '⚙️', { x: 250, y: 100 }),
      createNode('display', 'display', 'Main Display', '🖥️', { x: 450, y: 100 }),
      createNode('mic', 'audioSource', 'Ceiling Mics', '🎤', { x: 50, y: 250 }),
      createNode('dsp', 'audioMixer', 'DSP', '🎛️', { x: 250, y: 250 }),
      createNode('amp', 'amplifier', 'Amplifier', '📢', { x: 450, y: 250 }),
      createNode('speakers', 'speaker', 'Speakers', '🔊', { x: 650, y: 250 }),
      createNode('control', 'controller', 'Control System', '🎮', { x: 250, y: 350 }),
      createNode('touch', 'touchPanel', 'Touch Panel', '📱', { x: 50, y: 350 }),
    ],
    edges: [
      createEdge('e1', 'laptop', 'codec'),
      createEdge('e2', 'camera', 'codec'),
      createEdge('e3', 'codec', 'display'),
      createEdge('e4', 'mic', 'dsp'),
      createEdge('e5', 'dsp', 'amp'),
      createEdge('e6', 'amp', 'speakers'),
      createEdge('e7', 'touch', 'control'),
      createEdge('e8', 'control', 'codec'),
      createEdge('e9', 'control', 'dsp'),
    ],
  },
  {
    id: 'classroom',
    name: 'Classroom / Lecture Hall',
    description: 'Educational space with projector, doc camera, and multiple sources',
    type: 'SIGNAL_FLOW',
    nodes: [
      createNode('pc', 'videoSource', 'PC', '💻', { x: 50, y: 50 }),
      createNode('doccam', 'videoSource', 'Doc Camera', '📹', { x: 50, y: 130 }),
      createNode('laptop', 'videoSource', 'Laptop HDMI', '💻', { x: 50, y: 210 }),
      createNode('switcher', 'videoSwitcher', 'Switcher', '🔀', { x: 250, y: 130 }),
      createNode('projector', 'display', 'Projector', '🖥️', { x: 450, y: 130 }),
      createNode('mic', 'audioSource', 'Wireless Mic', '🎤', { x: 50, y: 320 }),
      createNode('dsp', 'audioMixer', 'DSP/Mixer', '🎛️', { x: 250, y: 320 }),
      createNode('amp', 'amplifier', 'Amplifier', '📢', { x: 450, y: 320 }),
      createNode('speakers', 'speaker', 'Speakers', '🔊', { x: 650, y: 320 }),
      createNode('control', 'controller', 'Control System', '🎮', { x: 250, y: 430 }),
      createNode('touch', 'touchPanel', 'Touch Panel', '📱', { x: 50, y: 430 }),
    ],
    edges: [
      createEdge('e1', 'pc', 'switcher'),
      createEdge('e2', 'doccam', 'switcher'),
      createEdge('e3', 'laptop', 'switcher'),
      createEdge('e4', 'switcher', 'projector'),
      createEdge('e5', 'mic', 'dsp'),
      createEdge('e6', 'dsp', 'amp'),
      createEdge('e7', 'amp', 'speakers'),
      createEdge('e8', 'touch', 'control'),
      createEdge('e9', 'control', 'switcher'),
      createEdge('e10', 'control', 'dsp'),
    ],
  },
  {
    id: 'auditorium',
    name: 'Auditorium / Theater',
    description: 'Large venue with multiple displays, cameras, and complex audio',
    type: 'SIGNAL_FLOW',
    nodes: [
      createNode('source1', 'videoSource', 'Blu-ray', '📹', { x: 50, y: 50 }),
      createNode('source2', 'videoSource', 'Presentation PC', '💻', { x: 50, y: 130 }),
      createNode('source3', 'videoSource', 'Camera 1', '📹', { x: 50, y: 210 }),
      createNode('source4', 'videoSource', 'Camera 2', '📹', { x: 50, y: 290 }),
      createNode('matrix', 'videoSwitcher', 'Matrix Switcher', '🔀', { x: 250, y: 170 }),
      createNode('display1', 'display', 'Main Screen', '🖥️', { x: 450, y: 80 }),
      createNode('display2', 'display', 'Side Display L', '🖥️', { x: 450, y: 160 }),
      createNode('display3', 'display', 'Side Display R', '🖥️', { x: 450, y: 240 }),
      createNode('mic1', 'audioSource', 'Wireless Handheld', '🎤', { x: 50, y: 400 }),
      createNode('mic2', 'audioSource', 'Wireless Lavalier', '🎤', { x: 50, y: 480 }),
      createNode('mic3', 'audioSource', 'Podium Mic', '🎤', { x: 50, y: 560 }),
      createNode('dsp', 'audioMixer', 'DSP', '🎛️', { x: 250, y: 480 }),
      createNode('amp1', 'amplifier', 'Main Amp', '📢', { x: 450, y: 450 }),
      createNode('amp2', 'amplifier', 'Sub Amp', '📢', { x: 450, y: 530 }),
      createNode('speakers', 'speaker', 'Speaker Array', '🔊', { x: 650, y: 490 }),
      createNode('control', 'controller', 'Control System', '🎮', { x: 250, y: 660 }),
      createNode('touch', 'touchPanel', 'Touch Panel', '📱', { x: 50, y: 660 }),
    ],
    edges: [
      createEdge('e1', 'source1', 'matrix'),
      createEdge('e2', 'source2', 'matrix'),
      createEdge('e3', 'source3', 'matrix'),
      createEdge('e4', 'source4', 'matrix'),
      createEdge('e5', 'matrix', 'display1'),
      createEdge('e6', 'matrix', 'display2'),
      createEdge('e7', 'matrix', 'display3'),
      createEdge('e8', 'mic1', 'dsp'),
      createEdge('e9', 'mic2', 'dsp'),
      createEdge('e10', 'mic3', 'dsp'),
      createEdge('e11', 'dsp', 'amp1'),
      createEdge('e12', 'dsp', 'amp2'),
      createEdge('e13', 'amp1', 'speakers'),
      createEdge('e14', 'amp2', 'speakers'),
      createEdge('e15', 'touch', 'control'),
      createEdge('e16', 'control', 'matrix'),
      createEdge('e17', 'control', 'dsp'),
    ],
  },
  {
    id: 'network-basic',
    name: 'Basic Office Network',
    description: 'Simple network topology with core switch and endpoints',
    type: 'NETWORK',
    nodes: [
      createNode('router', 'networkSwitch', 'Router/Firewall', '🌐', { x: 350, y: 50 }),
      createNode('core', 'networkSwitch', 'Core Switch', '🌐', { x: 350, y: 150 }),
      createNode('sw1', 'networkSwitch', 'Switch 1', '🌐', { x: 150, y: 280 }),
      createNode('sw2', 'networkSwitch', 'Switch 2', '🌐', { x: 350, y: 280 }),
      createNode('sw3', 'networkSwitch', 'Switch 3', '🌐', { x: 550, y: 280 }),
      createNode('ctrl1', 'controller', 'AV Controller', '🎮', { x: 50, y: 400 }),
      createNode('disp1', 'display', 'Display 1', '🖥️', { x: 150, y: 400 }),
      createNode('ctrl2', 'controller', 'AV Controller', '🎮', { x: 300, y: 400 }),
      createNode('disp2', 'display', 'Display 2', '🖥️', { x: 400, y: 400 }),
      createNode('codec', 'processor', 'Video Codec', '⚙️', { x: 550, y: 400 }),
    ],
    edges: [
      createEdge('e1', 'router', 'core'),
      createEdge('e2', 'core', 'sw1'),
      createEdge('e3', 'core', 'sw2'),
      createEdge('e4', 'core', 'sw3'),
      createEdge('e5', 'sw1', 'ctrl1'),
      createEdge('e6', 'sw1', 'disp1'),
      createEdge('e7', 'sw2', 'ctrl2'),
      createEdge('e8', 'sw2', 'disp2'),
      createEdge('e9', 'sw3', 'codec'),
    ],
  },
  {
    id: 'network-av',
    name: 'AV Network with VLANs',
    description: 'Segmented network with separate control, video, and audio VLANs',
    type: 'NETWORK',
    nodes: [
      createNode('router', 'networkSwitch', 'Core Router', '🌐', { x: 350, y: 30 }),
      createNode('ctrl-sw', 'networkSwitch', 'Control Switch\nVLAN 10', '🌐', { x: 150, y: 130 }),
      createNode('video-sw', 'networkSwitch', 'Video Switch\nVLAN 20', '🌐', { x: 350, y: 130 }),
      createNode('audio-sw', 'networkSwitch', 'Audio Switch\nVLAN 30', '🌐', { x: 550, y: 130 }),
      createNode('ctrl', 'controller', 'Control Processor', '🎮', { x: 100, y: 250 }),
      createNode('touch', 'touchPanel', 'Touch Panel', '📱', { x: 200, y: 250 }),
      createNode('encoder', 'processor', 'Video Encoder', '⚙️', { x: 300, y: 250 }),
      createNode('decoder', 'processor', 'Video Decoder', '⚙️', { x: 400, y: 250 }),
      createNode('dsp', 'audioMixer', 'DSP (Dante)', '🎛️', { x: 550, y: 250 }),
      createNode('amp', 'amplifier', 'Network Amp', '📢', { x: 550, y: 350 }),
    ],
    edges: [
      createEdge('e1', 'router', 'ctrl-sw'),
      createEdge('e2', 'router', 'video-sw'),
      createEdge('e3', 'router', 'audio-sw'),
      createEdge('e4', 'ctrl-sw', 'ctrl'),
      createEdge('e5', 'ctrl-sw', 'touch'),
      createEdge('e6', 'video-sw', 'encoder'),
      createEdge('e7', 'video-sw', 'decoder'),
      createEdge('e8', 'audio-sw', 'dsp'),
      createEdge('e9', 'audio-sw', 'amp'),
    ],
  },
  {
    id: 'rack-standard',
    name: 'Standard AV Rack (42U)',
    description: 'Typical equipment rack layout with amplifiers, DSP, and processors',
    type: 'RACK_LAYOUT',
    nodes: [
      createNode('u42', 'label', 'U42: Patch Panel', '📋', { x: 50, y: 20 }),
      createNode('u40', 'label', 'U40-41: Network Switch', '🌐', { x: 50, y: 50 }),
      createNode('u38', 'label', 'U38-39: Video Matrix', '🔀', { x: 50, y: 80 }),
      createNode('u36', 'label', 'U36-37: Video Codec', '⚙️', { x: 50, y: 110 }),
      createNode('u34', 'label', 'U34-35: Control Processor', '🎮', { x: 50, y: 140 }),
      createNode('u32', 'label', 'U32-33: DSP', '🎛️', { x: 50, y: 170 }),
      createNode('u28', 'label', 'U28-31: Power Amps', '📢', { x: 50, y: 200 }),
      createNode('u26', 'label', 'U26-27: Power Amps', '📢', { x: 50, y: 230 }),
      createNode('u24', 'label', 'U24-25: Power Amps', '📢', { x: 50, y: 260 }),
      createNode('u22', 'label', 'U22-23: Power Amps', '📢', { x: 50, y: 290 }),
      createNode('u20', 'label', 'U20-21: UPS', '🔋', { x: 50, y: 320 }),
      createNode('u1', 'label', 'U1-19: Power Dist.', '⚡', { x: 50, y: 350 }),
    ],
    edges: [],
  },
]

export function getTemplatesByType(type: 'SIGNAL_FLOW' | 'NETWORK' | 'RACK_LAYOUT'): DiagramTemplate[] {
  return diagramTemplates.filter((t) => t.type === type)
}

export function getTemplateById(id: string): DiagramTemplate | undefined {
  return diagramTemplates.find((t) => t.id === id)
}
