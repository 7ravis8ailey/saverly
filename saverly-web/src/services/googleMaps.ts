// Google Maps API integration matching original Replit approach

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            inputElement: HTMLInputElement,
            options?: {
              fields?: string[];
              types?: string[];
              componentRestrictions?: { country: string };
            }
          ) => any;
        };
        event?: {
          clearInstanceListeners: (instance: any) => void;
        };
        Geocoder?: new () => any;
        LatLng?: new (lat: number, lng: number) => any;
      };
    };
  }
}

let isGoogleMapsLoaded = false
let loadingPromise: Promise<void> | null = null

export async function loadGoogleMapsScript(): Promise<void> {
  if (isGoogleMapsLoaded) {
    return Promise.resolve()
  }

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps) {
      isGoogleMapsLoaded = true
      resolve()
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'))
      return
    }

    // Remove existing script if any
    const existingScript = document.getElementById('google-maps-script')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    // Set up callback
    ;(window as any).initGoogleMaps = () => {
      isGoogleMapsLoaded = true
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'))
    }

    document.head.appendChild(script)
  })

  return loadingPromise
}

export interface GeocodeResult {
  formatted_address: string
  geometry: {
    location: {
      lat(): number
      lng(): number
    }
  }
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  await loadGoogleMapsScript()

  return new Promise((resolve) => {
    if (!window.google?.maps?.Geocoder) {
      resolve(null)
      return
    }

    const geocoder = new window.google.maps.Geocoder()
    
    geocoder.geocode({ address }, (results: GeocodeResult[], status: string) => {
      if (status === 'OK' && results && results.length > 0) {
        resolve(results[0])
      } else {
        console.error('Geocoding failed:', status)
        resolve(null)
      }
    })
  })
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Use Google Maps Distance Matrix API for more accurate results
  // Fallback to Haversine formula if API not available
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export class GooglePlacesAutocomplete {
  private autocomplete: any
  private input: HTMLInputElement
  private onPlaceSelected: (place: GeocodeResult) => void

  constructor(
    input: HTMLInputElement,
    onPlaceSelected: (place: GeocodeResult) => void,
    options: {
      types?: string[]
      componentRestrictions?: { country: string }
    } = {}
  ) {
    this.input = input
    this.onPlaceSelected = onPlaceSelected

    this.initialize(options)
  }

  private async initialize(options: any) {
    await loadGoogleMapsScript()

    if (!window.google?.maps?.places?.Autocomplete) {
      console.error('Google Places Autocomplete not available')
      return
    }

    const defaultOptions = {
      fields: ['address_components', 'formatted_address', 'geometry'],
      types: ['address'],
      componentRestrictions: { country: 'us' },
      ...options
    }

    this.autocomplete = new window.google.maps.places.Autocomplete(
      this.input,
      defaultOptions
    )

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace()
      
      if (!place || !place.geometry || !place.geometry.location) {
        console.warn('No place details available')
        return
      }

      this.onPlaceSelected(place)
    })
  }

  destroy() {
    if (this.autocomplete && window.google?.maps?.event) {
      window.google.maps.event.clearInstanceListeners(this.autocomplete)
    }
  }
}

// Utility function to format address components (matching Replit approach)
export function formatAddressComponents(components: any[]): {
  street_number: string
  route: string
  locality: string
  administrative_area_level_1: string
  postal_code: string
  country: string
} {
  const getComponent = (type: string) => {
    const component = components.find(comp => comp.types.includes(type))
    return component ? component.short_name : ''
  }

  return {
    street_number: getComponent('street_number'),
    route: getComponent('route'),
    locality: getComponent('locality'),
    administrative_area_level_1: getComponent('administrative_area_level_1'),
    postal_code: getComponent('postal_code'),
    country: getComponent('country')
  }
}