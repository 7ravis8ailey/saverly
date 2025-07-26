import { useState, useEffect } from 'react'

interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
}

interface LocationError {
  code: number
  message: string
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<LocationError | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError({
        code: -1,
        message: 'Geolocation is not supported by this browser'
      })
      return
    }

    setRequesting(true)
    setError(null)

    // Check permission status if available
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        setPermission(result.state as any)
      } catch {
        // Fallback for browsers that don't support permissions API
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        setPermission('granted')
        setRequesting(false)
      },
      (err) => {
        let message = 'Failed to get location'
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location access denied by user'
            setPermission('denied')
            break
          case err.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable'
            break
          case err.TIMEOUT:
            message = 'Location request timed out'
            break
        }
        
        setError({
          code: err.code,
          message
        })
        setRequesting(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Auto-request location on mount if previously granted
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setPermission(result.state as any)
        if (result.state === 'granted') {
          requestLocation()
        }
      }).catch(() => {
        // Fallback: try to get location anyway
        requestLocation()
      })
    } else {
      // For browsers without permissions API, try to get location
      requestLocation()
    }
  }, [])

  return {
    location,
    error,
    requesting,
    permission,
    requestLocation
  }
}

// Utility function to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance * 0.621371 // Convert to miles
}