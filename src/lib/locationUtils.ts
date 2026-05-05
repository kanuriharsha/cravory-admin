/**
 * Utility functions for handling location and coordinate extraction
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Extract coordinates from various Google Maps URL formats
 * 
 * PRIORITY ORDER (most accurate to least accurate):
 * 1. !1d!2d parameters - actual place location (lng, lat) - direction/place URLs
 * 2. !3d!4d parameters - actual place location (lat, lng)
 * 3. !2d!3d parameters - actual place location (lng, lat)
 * 4. Query parameters ?q=lat,lng
 * 5. @lat,lng patterns - viewport/camera position (fallback only)
 * 
 * Note: The @lat,lng pattern represents the map's viewport position, 
 * which can be identical across different links and does not reflect 
 * the actual place location. Always prioritize !1d/!2d/!3d/!4d parameters.
 */
export async function extractCoordinatesFromMapsLink(
  link: string
): Promise<Coordinates | null> {
  try {
    if (!link || !link.trim()) {
      return null;
    }

    // PRIORITY 1: Direction/Place URL with !1d (lng) and !2d (lat) parameters
    // This represents the ACTUAL PLACE LOCATION in direction URLs
    // Example: https://www.google.com/maps/dir//Place/@16.43,80.62/data=!2m2!1d77.5738886!2d12.9703317
    const pattern1d2d = /!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/;
    const match1d2d = link.match(pattern1d2d);
    if (match1d2d) {
      const lng = parseFloat(match1d2d[1]);
      const lat = parseFloat(match1d2d[2]);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }

    // PRIORITY 2: Place URL with !3d (lat) and !4d (lng) parameters
    // This represents the ACTUAL PLACE LOCATION
    // Example: https://www.google.com/maps/place/...!3d17.385044!4d78.486671
    const pattern3d4d = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
    const match3d4d = link.match(pattern3d4d);
    if (match3d4d) {
      const lat = parseFloat(match3d4d[1]);
      const lng = parseFloat(match3d4d[2]);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }

    // PRIORITY 3: Place URL with !2d (lng) and !3d (lat) parameters
    // This also represents the ACTUAL PLACE LOCATION
    // Example: https://www.google.com/maps/place/...!2d78.486671!3d17.385044
    const pattern2d3d = /!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/;
    const match2d3d = link.match(pattern2d3d);
    if (match2d3d) {
      const lng = parseFloat(match2d3d[1]);
      const lat = parseFloat(match2d3d[2]);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }

    // PRIORITY 3: Query parameters ?q=lat,lng
    // Example: https://www.google.com/maps?q=17.385044,78.486671
    const patternQuery = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const matchQuery = link.match(patternQuery);
    if (matchQuery) {
      const lat = parseFloat(matchQuery[1]);
      const lng = parseFloat(matchQuery[2]);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }

    // PRIORITY 4 (FALLBACK): @lat,lng pattern - VIEWPORT POSITION
    // WARNING: This represents the map's camera position, NOT the actual place.
    // Only use this if no place-specific coordinates are found above.
    // Example: https://www.google.com/maps/@17.385044,78.486671,15z
    const patternViewport = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const matchViewport = link.match(patternViewport);
    if (matchViewport) {
      const lat = parseFloat(matchViewport[1]);
      const lng = parseFloat(matchViewport[2]);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }

    // PRIORITY 5: Short URL - expand it first, then use same priority order
    if (link.includes('goo.gl') || link.includes('maps.app.goo.gl')) {
      try {
        // For short URLs, try fetching to get the redirect location
        // Note: This may fail due to CORS, so we provide a fallback message
        const response = await fetch(link, { 
          method: 'GET',
          redirect: 'follow'
        });
        
        const expandedUrl = response.url;
        
        // If we got redirected to a different URL, try parsing it
        // This will recursively use the priority order above
        if (expandedUrl && expandedUrl !== link && expandedUrl.includes('google.com/maps')) {
          return extractCoordinatesFromMapsLink(expandedUrl);
        }
        
        // If no redirect, try parsing the fetched HTML content
        const html = await response.text();
        
        // PRIORITY 1: Try !1d!2d pattern first (direction/place URLs)
        const htmlPattern1d2d = /!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/;
        const htmlMatch1d2d = html.match(htmlPattern1d2d);
        if (htmlMatch1d2d) {
          const lng = parseFloat(htmlMatch1d2d[1]);
          const lat = parseFloat(htmlMatch1d2d[2]);
          if (isValidCoordinate(lat, lng)) {
            return { lat, lng };
          }
        }
        
        // PRIORITY 2: Try !3d!4d pattern (actual place location)
        const htmlPattern3d4d = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
        const htmlMatch3d4d = html.match(htmlPattern3d4d);
        if (htmlMatch3d4d) {
          const lat = parseFloat(htmlMatch3d4d[1]);
          const lng = parseFloat(htmlMatch3d4d[2]);
          if (isValidCoordinate(lat, lng)) {
            return { lat, lng };
          }
        }
        
        // PRIORITY 3: Try !2d!3d pattern (actual place location)
        const htmlPattern2d3d = /!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/;
        const htmlMatch2d3d = html.match(htmlPattern2d3d);
        if (htmlMatch2d3d) {
          const lng = parseFloat(htmlMatch2d3d[1]);
          const lat = parseFloat(htmlMatch2d3d[2]);
          if (isValidCoordinate(lat, lng)) {
            return { lat, lng };
          }
        }
        
        // PRIORITY 4 (FALLBACK): Try @ pattern (viewport position)
        const htmlPatternViewport = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const htmlMatchViewport = html.match(htmlPatternViewport);
        if (htmlMatchViewport) {
          const lat = parseFloat(htmlMatchViewport[1]);
          const lng = parseFloat(htmlMatchViewport[2]);
          if (isValidCoordinate(lat, lng)) {
            return { lat, lng };
          }
        }
      } catch (error) {
        console.error('Error expanding short URL:', error);
        // CORS error or network issue - short URLs might not work
        // User should open the link in browser and copy the full URL
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return null;
  }
}

/**
 * Validate if coordinates are within valid ranges
 * Latitude: -90 to 90
 * Longitude: -180 to 180
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * Returns "X.X km" or "XXX m" for small distances
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Get user's current location using browser geolocation API
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}
