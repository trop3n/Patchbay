export interface LedProcessorSpec {
  id: string
  brand: string
  model: string
  outputs: number
  maxResolution?: string
}

export const ledProcessorCatalog: LedProcessorSpec[] = [
  {
    id: 'novastar-vx4s',
    brand: 'NovaStar',
    model: 'VX4S',
    outputs: 4,
    maxResolution: '2300000 pixels',
  },
  {
    id: 'novastar-vx6s',
    brand: 'NovaStar',
    model: 'VX6S',
    outputs: 6,
    maxResolution: '3900000 pixels',
  },
  {
    id: 'brompton-sx40',
    brand: 'Brompton',
    model: 'SX40',
    outputs: 4,
    maxResolution: '2048x1200',
  },
  {
    id: 'brompton-s4',
    brand: 'Brompton',
    model: 'S4',
    outputs: 4,
    maxResolution: '2048x1200',
  },
  {
    id: 'generic-processor',
    brand: 'Generic',
    model: 'LED Processor',
    outputs: 4,
  },
]
