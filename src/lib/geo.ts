/**
 * Izračuna razdaljo med dvema GPS koordinatama (Haversine formula)
 * Vrne razdaljo v metrih
 */
export function haversineRazdalja(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000 // Polmer Zemlje v metrih
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolokacija ni podprta v tem brskalniku.'))
      return
    }
    if (!window.isSecureContext) {
      reject(new Error('Geolokacija zahteva varno povezavo (HTTPS ali localhost).'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        let message = 'GPS lokalizacija ni uspela.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Dostop do GPS je zavrnjen. Omogoči lokacijo v nastavitvah brskalnika.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'GPS ni mogel določiti položaja. Poskusi znova na prostem mestu.'
            break
          case error.TIMEOUT:
            message = 'GPS zahteva več časa. Poskusi znova ali se prepričaj, da ima naprava dostop do signala.'
            break
        }
        reject(new Error(`${message} ${error.message || ''}`.trim()))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

export const MAX_RAZDALJA_M = 50
