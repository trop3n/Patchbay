export interface LedPanelSpec {
  id: string
  brand: string
  model: string
  pixelPitch: number
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
  weight?: number
  maxBrightness?: number
  ports: {
    dataIn: number
    dataOut: number
    powerIn: number
  }
}

export const ledPanelCatalog: LedPanelSpec[] = [
  {
    id: 'generic-p1.5',
    brand: 'Generic',
    model: 'P1.5 Indoor',
    pixelPitch: 1.5,
    widthMm: 500,
    heightMm: 500,
    widthPx: 333,
    heightPx: 333,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'generic-p2.6',
    brand: 'Generic',
    model: 'P2.6 Indoor',
    pixelPitch: 2.6,
    widthMm: 500,
    heightMm: 500,
    widthPx: 192,
    heightPx: 192,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'generic-p3.9',
    brand: 'Generic',
    model: 'P3.9 Indoor/Outdoor',
    pixelPitch: 3.9,
    widthMm: 500,
    heightMm: 500,
    widthPx: 128,
    heightPx: 128,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'generic-p4.8',
    brand: 'Generic',
    model: 'P4.8 Outdoor',
    pixelPitch: 4.8,
    widthMm: 500,
    heightMm: 500,
    widthPx: 104,
    heightPx: 104,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'generic-p10',
    brand: 'Generic',
    model: 'P10 Outdoor',
    pixelPitch: 10,
    widthMm: 960,
    heightMm: 960,
    widthPx: 96,
    heightPx: 96,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'roe-bp2',
    brand: 'ROE',
    model: 'Black Pearl BP2',
    pixelPitch: 2.84,
    widthMm: 500,
    heightMm: 500,
    widthPx: 176,
    heightPx: 176,
    weight: 8.2,
    maxBrightness: 1200,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'roe-cb5',
    brand: 'ROE',
    model: 'Carbon CB5',
    pixelPitch: 5.77,
    widthMm: 500,
    heightMm: 500,
    widthPx: 86,
    heightPx: 86,
    weight: 7.5,
    maxBrightness: 5500,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'absen-pl25',
    brand: 'Absen',
    model: 'PL2.5 Pro',
    pixelPitch: 2.5,
    widthMm: 600,
    heightMm: 337.5,
    widthPx: 240,
    heightPx: 135,
    weight: 8.5,
    maxBrightness: 800,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'absen-a27',
    brand: 'Absen',
    model: 'A27',
    pixelPitch: 2.7,
    widthMm: 600,
    heightMm: 337.5,
    widthPx: 222,
    heightPx: 125,
    weight: 8.0,
    maxBrightness: 1000,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'unilumin-upadiii',
    brand: 'Unilumin',
    model: 'UpadIII H2.6',
    pixelPitch: 2.6,
    widthMm: 500,
    heightMm: 500,
    widthPx: 192,
    heightPx: 192,
    weight: 7.0,
    maxBrightness: 1200,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
  {
    id: 'unilumin-ustorm39',
    brand: 'Unilumin',
    model: 'Ustorm 3.9',
    pixelPitch: 3.9,
    widthMm: 500,
    heightMm: 500,
    widthPx: 128,
    heightPx: 128,
    weight: 9.5,
    maxBrightness: 5500,
    ports: { dataIn: 1, dataOut: 1, powerIn: 1 },
  },
]

export const brandColors: Record<string, string> = {
  Generic: 'border-blue-500 bg-blue-500/10',
  ROE: 'border-teal-500 bg-teal-500/10',
  Absen: 'border-amber-500 bg-amber-500/10',
  Unilumin: 'border-violet-500 bg-violet-500/10',
}

export function getBrands(): string[] {
  return [...new Set(ledPanelCatalog.map((p) => p.brand))]
}
