// Palet resmi KKN-PPM UGM Nawadaya Sumba (brand kit) untuk kode yang butuh warna di JS
// (canvas, style inline). Sumber yang sama dengan token --color-brand-* di styles.css.

export const BRAND = {
  peach: '#f78d66',
  blue: '#3057a6',
  teal: '#16b8c5',
  magenta: '#a2258d',
  coral: '#f05b6e',
  rose: '#f5a1ae',
  yellow: '#fdde09',
  paper: '#f4f5f7',
  green: '#45ba84',
  mint: '#75d9ab',
  /** Teks utama di atas latar terang */
  ink: '#0f172a',
  /** Biru tua turunan #3057a6 untuk slide gelap (galeri, footer) */
  deep: '#1a2f62',
} as const

export type BrandColor = 'peach' | 'blue' | 'teal' | 'magenta' | 'coral' | 'rose' | 'yellow' | 'green' | 'mint' | 'white'

export type Cluster = 'Saintek' | 'Soshum' | 'Medika' | 'Agro'

/**
 * Warna kluster mengikuti contoh slide brand kit:
 * bingkai (frame) dan bunga (bloom) memakai pasangan warna yang berbeda.
 * `text` adalah versi yang cukup kontras untuk teks di latar terang.
 */
export const CLUSTER_THEME: Record<Cluster, { frame: BrandColor; bloom: BrandColor; color: string; text: string }> = {
  Saintek: { frame: 'yellow', bloom: 'rose', color: BRAND.yellow, text: '#9a7b00' },
  Soshum: { frame: 'teal', bloom: 'peach', color: BRAND.teal, text: '#0c7f89' },
  Medika: { frame: 'peach', bloom: 'teal', color: BRAND.peach, text: '#c4532b' },
  Agro: { frame: 'rose', bloom: 'yellow', color: BRAND.rose, text: '#c2475c' },
}

export const CLUSTER_COLOR: Record<Cluster, string> = {
  Saintek: CLUSTER_THEME.Saintek.color,
  Soshum: CLUSTER_THEME.Soshum.color,
  Medika: CLUSTER_THEME.Medika.color,
  Agro: CLUSTER_THEME.Agro.color,
}

export const COLOR_HEX: Record<BrandColor, string> = {
  peach: BRAND.peach,
  blue: BRAND.blue,
  teal: BRAND.teal,
  magenta: BRAND.magenta,
  coral: BRAND.coral,
  rose: BRAND.rose,
  yellow: BRAND.yellow,
  green: BRAND.green,
  mint: BRAND.mint,
  white: '#ffffff',
}

/** Karakter untuk efek acak/decode di seluruh situs */
export const ASCII_GLYPHS = '01<>/\\|=+*#%@$&?!:;{}[]'
