export const nodeTypes = [
  { type: 'videoSource', label: 'Video Source', category: 'Video', icon: '📹' },
  { type: 'display', label: 'Display', category: 'Video', icon: '🖥️' },
  { type: 'videoSwitcher', label: 'Video Switcher', category: 'Video', icon: '🔀' },
  { type: 'processor', label: 'Processor', category: 'Video', icon: '⚙️' },
  { type: 'audioSource', label: 'Audio Source', category: 'Audio', icon: '🎤' },
  { type: 'speaker', label: 'Speaker', category: 'Audio', icon: '🔊' },
  { type: 'audioMixer', label: 'Audio Mixer/DSP', category: 'Audio', icon: '🎛️' },
  { type: 'amplifier', label: 'Amplifier', category: 'Audio', icon: '📢' },
  { type: 'controller', label: 'Controller', category: 'Control', icon: '🎮' },
  { type: 'networkSwitch', label: 'Network Switch', category: 'Network', icon: '🌐' },
  { type: 'touchPanel', label: 'Touch Panel', category: 'Control', icon: '📱' },
  { type: 'input', label: 'Input Port', category: 'Generic', icon: '📥' },
  { type: 'output', label: 'Output Port', category: 'Generic', icon: '📤' },
  { type: 'label', label: 'Label', category: 'Generic', icon: '🏷️' },
] as const

export type NodeType = typeof nodeTypes[number]['type']

export const nodeCategories = ['Video', 'Audio', 'Control', 'Network', 'Generic'] as const
