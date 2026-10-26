// Palet "Senja ASCII" untuk kode yang butuh warna di JS (canvas, style inline).
// Sumber yang sama dengan token --color-* di styles.css.

export const SENJA = {
  ink: '#0b1220',
  ink850: '#0f1729',
  ink800: '#141d33',
  cream: '#f6efe4',
  mist: '#aab3c8',
  gold: '#ffc56b',
  amber: '#ffab2f',
  coral: '#f27a72',
  violet: '#9b86e0',
  teal: '#63c7c9',
  savana: '#b9d36a',
} as const

export type Cluster = 'Saintek' | 'Soshum' | 'Medika' | 'Agro'

export const CLUSTER_COLOR: Record<Cluster, string> = {
  Saintek: SENJA.teal,
  Soshum: SENJA.violet,
  Medika: SENJA.coral,
  Agro: SENJA.savana,
}

/** Karakter untuk efek acak/decode di seluruh situs */
export const ASCII_GLYPHS = '01<>/\\|=+*#%@$&?!:;{}[]'
