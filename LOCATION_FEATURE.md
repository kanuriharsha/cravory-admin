# Restaurant Location Feature

## Overview
The admin panel now supports adding restaurant locations using Google Maps links or manual coordinate entry. The system automatically extracts latitude and longitude from Google Maps URLs and stores them for distance calculation.

## Features

### 1. **Google Maps Link Support**
- Paste any Google Maps link and the system automatically extracts coordinates
- Supports multiple URL formats:
  - Standard URLs: `https://www.google.com/maps/@17.385044,78.486671,15z`
  - Place URLs: `https://www.google.com/maps/place/Restaurant+Name/@17.385044,78.486671`
  - Query URLs: `https://www.google.com/maps?q=17.385044,78.486671`
  - Short URLs: `https://goo.gl/maps/xxxxx` or `https://maps.app.goo.gl/xxxxx`

### 2. **Manual Coordinate Entry**
- Enter latitude and longitude manually if Maps link fails
- Validates coordinate ranges (Latitude: -90 to 90, Longitude: -180 to 180)

### 3. **Distance Calculation Ready**
- Coordinates stored in database for future use
- Can calculate distance between user location and restaurant
- Uses Haversine formula for accurate distance calculation

## How to Use

### Adding a Restaurant with Location

1. Click "Add Restaurant" button
2. Fill in required details (name, cuisine, address)
3. **Provide Location (Required)**:
   
   **Option A: Using Google Maps Link**
   - Go to Google Maps
   - Find the restaurant location
   - Copy the URL from browser address bar
   - Paste into "Google Maps Link" field
   - Coordinates will be extracted automatically
   
   **Option B: Manual Entry**
   - Enter latitude directly (e.g., 17.385044)
   - Enter longitude directly (e.g., 78.486671)

4. Verify coordinates appear in latitude/longitude fields
5. Complete other details and save

### Getting Coordinates from Google Maps

#### Method 1: Right-click on Map
1. Open Google Maps
2. Find the location
3. Right-click on the exact spot
4. Click on the coordinates that appear (e.g., "17.385044, 78.486671")
5. Coordinates are copied to clipboard
6. Paste in latitude/longitude fields

#### Method 2: Share Link
1. Open Google Maps
2. Search for the location
3. Click "Share" button
4. Copy the link
5. Paste in "Google Maps Link" field

#### Method 3: Address Bar URL
1. Navigate to location on Google Maps
2. Copy entire URL from browser address bar
3. Paste in "Google Maps Link" field

## Database Structure

Coordinates are stored in the restaurant document:

```json
{
  "name": "Restaurant Name",
  "location": {
    "address": "Full address",
    "city": "Hyderabad",
    "coordinates": {
      "latitude": 17.385044,
      "longitude": 78.486671
    }
  }
}
```

## Future Usage

These stored coordinates can be used to:

1. **Calculate Distance**: When a user enables location access, calculate distance between user and restaurant
   ```javascript
   import { calculateDistance, formatDistance } from '@/lib/locationUtils';
   
   const userLat = 17.400000;
   const userLng = 78.500000;
   const restaurantLat = restaurant.location.coordinates.latitude;
   const restaurantLng = restaurant.location.coordinates.longitude;
   
   const distanceKm = calculateDistance(userLat, userLng, restaurantLat, restaurantLng);
   const formattedDistance = formatDistance(distanceKm); // "2.5 km" or "500 m"
   ```

2. **Sort by Distance**: Sort restaurants by proximity to user
3. **Delivery Radius**: Check if restaurant delivers to user's location
4. **Map Display**: Show restaurant location on a map

## Validation

The system validates:
- ✅ Latitude is between -90 and 90
- ✅ Longitude is between -180 and 180
- ✅ Coordinates are required before saving
- ✅ Maps link format is recognized
- ✅ Numeric values are parsed correctly

## Error Handling

- If Maps link doesn't contain coordinates, user is prompted to enter manually
- Invalid coordinate ranges show validation error
- Failed coordinate extraction shows helpful error message
- Empty location fields prevent restaurant creation

## Technical Details

### Location Utility Functions
Location: `src/lib/locationUtils.ts`

Available functions:
- `extractCoordinatesFromMapsLink(link)` - Extract coordinates from Google Maps URL
- `isValidCoordinate(lat, lng)` - Validate coordinate ranges
- `calculateDistance(lat1, lng1, lat2, lng2)` - Calculate distance in km
- `formatDistance(distanceKm)` - Format distance for display
- `getCurrentLocation()` - Get user's browser location

### Coordinate Extraction Patterns

The system uses multiple regex patterns to extract coordinates **in priority order**:

1. **!1d!2d pattern** (PRIORITY 1 - Actual Place Location): `/!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/`
   - Used in direction URLs (`/dir/` paths)
   - Represents exact place/restaurant location
   - Note: !1d = longitude, !2d = latitude

2. **!3d!4d pattern** (PRIORITY 2 - Actual Place Location): `/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/`
   - Represents exact place/restaurant location
   - Most common for named places
   - Note: !3d = latitude, !4d = longitude

3. **!2d!3d pattern** (PRIORITY 3 - Actual Place Location): `/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/`
   - Alternative format for place coordinates  
   - Also represents exact location
   - Note: !2d = longitude, !3d = latitude

4. **Query pattern** (PRIORITY 4): `/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/`
   - Direct coordinate query parameters

5. **@-pattern** (PRIORITY 5 - Viewport Fallback): `/@(-?\d+\.?\d*),(-?\d+\.?\d*)/`
   - Represents map camera/viewport position
   - Can be identical across different places
   - Only used if no place coordinates found

**Important:** The @ pattern represents the viewport (camera position), NOT the actual place location. The system prioritizes !1d!2d, !3d!4d, and !2d!3d patterns to ensure accurate restaurant coordinates for distance calculations.

### Short URL Handling

For short URLs (goo.gl, maps.app.goo.gl):
- System attempts to fetch and follow redirects
- Extracts coordinates from expanded URL using same priority order
- Falls back to manual entry if expansion fails due to CORS

## Example Coordinates (Hyderabad)

- HITEC City: `17.4435, 78.3772`
- Banjara Hills: `17.4126, 78.4401`
- Madhapur: `17.4485, 78.3908`
- Gachibowli: `17.4400, 78.3489`
- Jubilee Hills: `17.4239, 78.4128`

## Troubleshooting

**Q: Maps link doesn't extract coordinates**
- Try copying the full URL from address bar
- Ensure URL contains location coordinates
- Use right-click method to get exact coordinates

**Q: Short URL not working**
- Browser security may block URL expansion
- Copy full URL instead of short link
- Or enter coordinates manually

**Q: Invalid coordinate error**
- Verify latitude is between -90 and 90
- Verify longitude is between -180 and 180
- Check for typos in numbers

**Q: Coordinates required error**
- Must provide either Maps link OR manual coordinates
- Ensure both latitude and longitude fields are filled
- Coordinates cannot be empty

## Support

For issues or questions about the location feature, check:
1. Browser console for detailed error messages
2. Ensure Maps link is from Google Maps (not other map services)
3. Verify internet connection for short URL expansion
