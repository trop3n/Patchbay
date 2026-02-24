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
  nodeType: string,
  label: string,
  position: { x: number; y: number }
): Node => ({
  id,
  type: 'avNode',
  position,
  data: { label, nodeType },
})

const createEdge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
  type: 'default',
})

export const diagramTemplates: DiagramTemplate[] = [
  {
    id: 'video-rack',
    name: 'Video Rack',
    description: 'Standard video rack with sources, switcher, and displays',
    type: 'SIGNAL_FLOW',
    nodes: [
      createNode('v1', 'laptop', 'Laptop 1', { x: 50, y: 50 }),
      createNode('v2', 'laptop', 'Laptop 2', { x: 50, y: 130 }),
      createNode('v3', 'camera', 'Camera', { x: 50, y: 210 }),
      createNode('v4', 'mediaPlayer', 'Media Player', { x: 50, y: 290 }),
      createNode('v5', 'videoSwitcher', 'HDMI Matrix', { x: 300, y: 170 }),
      createNode('v6', 'scaler', 'Scaler', { x: 500, y: 170 }),
      createNode('v7', 'projector', 'Projector', { x: 700, y: 100 }),
      createNode('v8', 'display', 'Confidence Monitor', { x: 700, y: 240 }),
    ],
    edges: [
      createEdge('e1', 'v1', 'v5'),
      createEdge('e2', 'v2', 'v5'),
      createEdge('e3', 'v3', 'v5'),
      createEdge('e4', 'v4', 'v5'),
      createEdge('e5', 'v5', 'v6'),
      createEdge('e6', 'v6', 'v7'),
      createEdge('e7', 'v6', 'v8'),
    ],
  },
  {
    id: 'audio-rack',
    name: 'Audio Rack',
    description: 'Standard audio rack with sources, DSP, and outputs',
    type: 'SIGNAL_FLOW',
    nodes: [
      createNode('a1', 'wirelessMic', 'Wireless Mic', { x: 50, y: 50 }),
      createNode('a2', 'microphone', 'Podium Mic', { x: 50, y: 130 }),
      createNode('a3', 'audioSource', 'Laptop Audio', { x: 50, y: 210 }),
      createNode('a4', 'dsp', 'DSP', { x: 300, y: 130 }),
      createNode('a5', 'amplifier', 'Power Amp', { x: 500, y: 130 }),
      createNode('a6', 'speaker', 'Ceiling Speakers', { x: 700, y: 50 }),
      createNode('a7', 'speaker', 'Floor Monitors', { x: 700, y: 210 }),
    ],
    edges: [
      createEdge('e1', 'a1', 'a4'),
      createEdge('e2', 'a2', 'a4'),
      createEdge('e3', 'a3', 'a4'),
      createEdge('e4', 'a4', 'a5'),
      createEdge('e5', 'a5', 'a6'),
      createEdge('e6', 'a5', 'a7'),
    ],
  },
  {
    id: 'network-topology',
    name: 'Network Topology',
    description: 'Basic network topology with core switch and endpoints',
    type: 'NETWORK',
    nodes: [
      createNode('n1', 'networkSwitch', 'Core Switch', { x: 350, y: 50 }),
      createNode('n2', 'networkSwitch', 'Switch A', { x: 150, y: 200 }),
      createNode('n3', 'networkSwitch', 'Switch B', { x: 350, y: 200 }),
      createNode('n4', 'networkSwitch', 'Switch C', { x: 550, y: 200 }),
      createNode('n5', 'controller', 'AV Processor', { x: 50, y: 350 }),
      createNode('n6', 'touchPanel', 'Touch Panel 1', { x: 150, y: 350 }),
      createNode('n7', 'touchPanel', 'Touch Panel 2', { x: 350, y: 350 }),
      createNode('n8', 'encoder', 'Streaming Encoder', { x: 550, y: 350 }),
      createNode('n9', 'display', 'Display', { x: 650, y: 350 }),
    ],
    edges: [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n1', 'n3'),
      createEdge('e3', 'n1', 'n4'),
      createEdge('e4', 'n2', 'n5'),
      createEdge('e5', 'n2', 'n6'),
      createEdge('e6', 'n3', 'n7'),
      createEdge('e7', 'n4', 'n8'),
      createEdge('e8', 'n4', 'n9'),
    ],
  },
  {
    id: 'av-conference-room',
    name: 'AV Conference Room',
    description: 'Complete conference room setup with video, audio, and control',
    type: 'SIGNAL_FLOW',
    nodes: [
      createNode('c1', 'laptop', 'Laptop', { x: 50, y: 50 }),
      createNode('c2', 'camera', 'Camera', { x: 50, y: 130 }),
      createNode('c3', 'microphone', 'Ceiling Mics', { x: 50, y: 250 }),
      createNode('c4', 'wirelessMic', 'Wireless Mic', { x: 50, y: 330 }),
      createNode('c5', 'videoSwitcher', 'Presentation Switch', { x: 250, y: 90 }),
      createNode('c6', 'dsp', 'DSP', { x: 250, y: 290 }),
      createNode('c7', 'controller', 'Control System', { x: 250, y: 450 }),
      createNode('c8', 'networkSwitch', 'Network Switch', { x: 450, y: 450 }),
      createNode('c9', 'encoder', 'Encoder', { x: 450, y: 90 }),
      createNode('c10', 'display', 'Display', { x: 650, y: 50 }),
      createNode('c11', 'touchPanel', 'Touch Panel', { x: 650, y: 130 }),
      createNode('c12', 'speaker', 'Speakers', { x: 650, y: 290 }),
    ],
    edges: [
      createEdge('e1', 'c1', 'c5'),
      createEdge('e2', 'c2', 'c5'),
      createEdge('e3', 'c5', 'c9'),
      createEdge('e4', 'c9', 'c10'),
      createEdge('e5', 'c3', 'c6'),
      createEdge('e6', 'c4', 'c6'),
      createEdge('e7', 'c6', 'c12'),
      createEdge('e8', 'c7', 'c8'),
      createEdge('e9', 'c7', 'c11'),
      createEdge('e10', 'c8', 'c9'),
    ],
  },
]

export function getTemplateById(id: string): DiagramTemplate | undefined {
  return diagramTemplates.find((t) => t.id === id)
}

export function getTemplatesByType(type: DiagramTemplate['type']): DiagramTemplate[] {
  return diagramTemplates.filter((t) => t.type === type)
}
