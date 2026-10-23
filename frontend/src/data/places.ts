// Koordinat dari OpenStreetMap (Nominatim). Jarak dihitung garis lurus.

export interface Place {
  lat: number
  lon: number
}

export const KKN_LOCATION = {
  desa: 'Desa Rada Mata',
  kecamatan: 'Kecamatan Kota Tambolaka',
  kabupaten: 'Kabupaten Sumba Barat Daya',
  provinsi: 'Nusa Tenggara Timur',
  short: 'Rada Mata, Tambolaka',
  // Kantor Desa Rada Mata
  lat: -9.42123,
  lon: 119.24364,
}

export const PLACES = {
  radaMata: { lat: KKN_LOCATION.lat, lon: KKN_LOCATION.lon },
  // Kantor Kecamatan Kota Tambolaka
  kecTambolaka: { lat: -9.42051, lon: 119.21899 },
  bandara: { lat: -9.41023, lon: 119.24334 },
  weetebula: { lat: -9.44464, lon: 119.23093 },
  waikelo: { lat: -9.38923, lon: 119.21996 },
  weekuri: { lat: -9.49109, lon: 118.95983 },
  mandorak: { lat: -9.49909, lon: 118.95411 },
  ratenggaro: { lat: -9.62772, lon: 119.00305 },
} satisfies Record<string, Place>

export function distanceKm(a: Place, b: Place) {
  const R = 6371
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Jarak dari Desa Rada Mata, dibulatkan, mis. "± 32 km" */
export function distanceFromKkn(p: Place) {
  const km = distanceKm(PLACES.radaMata, p)
  return km < 10 ? `± ${km.toFixed(1).replace('.', ',')} km` : `± ${Math.round(km)} km`
}

/** 9.42123 → 9°25′16″ */
export function toDms(value: number, pos: string, neg: string) {
  const v = Math.abs(value)
  const d = Math.floor(v)
  const mFloat = (v - d) * 60
  const m = Math.floor(mFloat)
  const s = Math.round((mFloat - m) * 60)
  const [mm, ss] = s === 60 ? [m + 1, 0] : [m, s]
  return `${d}°${String(mm).padStart(2, '0')}′${String(ss).padStart(2, '0')}″ ${value < 0 ? neg : pos}`
}

export function formatCoords(p: Place) {
  return `${toDms(p.lat, 'LU', 'LS')}  ${toDms(p.lon, 'BT', 'BB')}`
}

/** Email tim untuk kontak & buku tamu (situs statis tanpa server) */
export const CONTACT_EMAIL = 'kkn.nawadaya.sumba@ugm.ac.id'
