# Google Maps URL Examples - Quick Reference

## 🎯 Important: Coordinate Types

Google Maps URLs contain TWO types of coordinates:

1. **Place Coordinates** (`!3d!4d` or `!2d!3d` parameters) ✅ **MOST ACCURATE**
   - Exact location of the selected place/restaurant
   - Used for actual distance calculations
   - The system prioritizes these coordinates

2. **Viewport Coordinates** (`@lat,lng` in URL) ⚠️ **LESS ACCURATE**
   - Map camera/view position  
   - Can be identical across different places
   - Only used as fallback if place coordinates not found

**Example URL with BOTH:**
```
https://www.google.com/maps/place/Restaurant/@17.4,78.4,15z/data=!3d17.5!4d78.5
                                              ^^^^^^^^^^^          ^^^^^^^^^^^^^^^
                                              Viewport (camera)    Place (actual) ✅
```
The system extracts `17.5, 78.5` (place coordinates), NOT `17.4, 78.4` (viewport).

---

## ✅ Supported URL Formats

### 1. Place URL with !3d!4d Parameters ⭐ **RECOMMENDED**
**What it looks like:**
```
https://www.google.com/maps/place/Restaurant+Name/@17.385044,78.486671,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb99daeaebd2c7:0xae93b78392bafbc2!3d17.385044!4d78.486671
```

**How to get it:**
- Search for a place on Google Maps
- Click "Share" → Copy link
- Or copy from address bar
- **Most accurate for restaurants and named places** ✅

**Example:**
```
https://www.google.com/maps/place/Biriyani/@17.4239,78.4128,17z/data=!3d17.4239!4d78.4128
→ Extracts: 17.4239, 78.4128 from !3d!4d (place location)
```

---

### 2. Place URL with !2d!3d Parameters ⭐ **ALSO ACCURATE**
**What it looks like:**
```
https://www.google.com/maps/place/Restaurant/data=!2d78.486671!3d17.385044
```

**How it works:**
- Alternative format used by Google Maps
- `!2d` = longitude, `!3d` = latitude
- Also represents exact place location ✅

**Example:**
```
https://www.google.com/maps/place/Cafe/data=!2d78.4128!3d17.4239
→ Extracts: 17.4239, 78.4128 from !2d!3d (place location)
```

---

### 3. Standard @-Format (Viewport Fallback)
**What it looks like:**
```
https://www.google.com/maps/@17.385044,78.486671,15z
https://maps.google.com/@17.385044,78.486671,12z
```

**How to get it:**
- Navigate to location on Google Maps
- Copy URL from browser address bar
- ⚠️ **Note:** Represents camera position, not necessarily exact place

**Example:**
```
https://www.google.com/maps/@17.4435,78.3772,15z
→ Extracts: 17.4435, 78.3772 (only if no !3d!4d found)
```

---

### 4. Query Parameter Format
**What it looks like:**
```
https://www.google.com/maps?q=17.385044,78.486671
https://maps.google.com/?q=17.385044,78.486671
```

**How to get it:**
- Manually constructed URL
- Some share links use this format
- Simple and clean ✅

**Example:**
```
https://www.google.com/maps?q=17.4400,78.3489
→ Extracts: 17.4400, 78.3489
```

---

### 4. Short URLs (Partial Support)
**What it looks like:**
```
https://goo.gl/maps/abc123
https://maps.app.goo.gl/xyz789
```

**How to get it:**
- Click "Share" → "Copy link" on Google Maps mobile
- Get shortened version

**Note:** ⚠️ May fail due to browser CORS restrictions
**Workaround:** Open the short URL in browser, then copy the full URL from address bar

---

## 🎯 How to Get Coordinates

### Method 1: Right-Click on Map (Easiest for Exact Point)
1. Open Google Maps
2. Find the exact location
3. **Right-click** on the spot
4. Click the coordinates shown (e.g., "17.385044, 78.486671")
5. Coordinates copied! ✅
6. Paste in latitude/longitude fields

**OR paste in Google Maps Link field as:**
```
https://www.google.com/maps?q=17.385044,78.486671
```

---

### Method 2: Share Button (Easiest for Places)
1. Search for restaurant/place on Google Maps
2. Click **"Share"** button
3. Click **"Copy link"**
4. Paste in "Google Maps Link" field
5. Coordinates extracted automatically ✅

---

### Method 3: Address Bar URL (Always Works)
1. Navigate to location on Google Maps
2. Wait for map to load completely
3. Copy **entire URL** from browser address bar
4. Paste in "Google Maps Link" field
5. Coordinates extracted automatically ✅

---

## 🧪 Test Examples

### Test with These Hyderabad Locations:

#### HITEC City (Tech Hub)
```
URL: https://www.google.com/maps/@17.4435,78.3772,15z
Lat: 17.4435
Lng: 78.3772
```

#### Gachibowli (IT Corridor)
```
URL: https://www.google.com/maps/@17.4400,78.3489,15z
Lat: 17.4400
Lng: 78.3489
```

#### Banjara Hills (Upscale Area)
```
URL: https://www.google.com/maps/@17.4126,78.4401,15z
Lat: 17.4126
Lng: 78.4401
```

#### Madhapur (Commercial Area)
```
URL: https://www.google.com/maps/@17.4485,78.3908,15z
Lat: 17.4485
Lng: 78.3908
```

---

## ❌ URL Formats That Won't Work

### Other Map Services
```
❌ https://www.openstreetmap.org/...
❌ https://www.bing.com/maps/...
❌ https://maps.apple.com/...
```
**Why:** Only Google Maps URLs are supported
**Solution:** Find location on Google Maps instead

### Embedded Maps
```
❌ <iframe src="https://www.google.com/maps/embed?...">
```
**Why:** Embed code is not a Maps link
**Solution:** Copy the actual Maps URL from the embed source

### Direction Links
```
❌ https://www.google.com/maps/dir/Origin/Destination
```
**Why:** Contains two sets of coordinates (origin + destination)
**Solution:** Use single location link or enter coordinates manually

---

## 💡 Pro Tips

### Tip 1: Check for Coordinates in URL
✅ Good: URL contains numbers like `@17.4435,78.3772`
❌ Bad: URL only has place name without coordinates

### Tip 2: Use Full URL for Best Results
✅ Good: Copy entire URL from address bar
❌ Risky: Use shortened URLs (may fail)

### Tip 3: Verify Extraction
After pasting Maps link:
- ✅ Success toast appears
- ✅ Latitude field auto-fills
- ✅ Longitude field auto-fills

If not:
- ❌ Error toast appears
- ⚠️ Enter coordinates manually

### Tip 4: Manual Entry Fallback
If extraction fails:
1. Right-click on map location
2. Click coordinates to copy
3. First number = Latitude (usually 17.x for Hyderabad)
4. Second number = Longitude (usually 78.x for Hyderabad)
5. Paste in respective fields

---

## 🔍 Regex Patterns Used (Technical)

For developers - these patterns extract coordinates **in priority order**:

```typescript
// PRIORITY 1: !1d (lng) !2d (lat) - ACTUAL PLACE LOCATION ⭐ (direction URLs)
/!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/

// PRIORITY 2: !3d (lat) !4d (lng) - ACTUAL PLACE LOCATION ⭐
/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/

// PRIORITY 3: !2d (lng) !3d (lat) - ACTUAL PLACE LOCATION ⭐
/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/

// PRIORITY 4: ?q=lat,lng - QUERY PARAMETERS
/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/

// PRIORITY 5: @lat,lng - VIEWPORT/CAMERA POSITION (fallback only)
/@(-?\d+\.?\d*),(-?\d+\.?\d*)/
```

**Important:** The system checks patterns in this order and returns the FIRST match. 
This ensures actual place coordinates (!1d!2d, !3d!4d, or !2d!3d) are always used instead 
of viewport coordinates (@lat,lng) when both are present in the URL.

**Note:** Direction URLs (with `/dir/` in the path) often use the !1d!2d pattern.

---

## 🎬 Step-by-Step Example

### Adding Restaurant "Paradise Biryani"

**Step 1:** Search on Google Maps
```
Type: "Paradise Biryani Hyderabad"
```

**Step 2:** Click Share
```
Share button → Copy link
```

**Step 3:** You get URL like:
```
https://www.google.com/maps/place/Paradise+Biryani/@17.4355,78.4483,17z/data=!3d17.4355!4d78.4483
```

**Step 4:** Paste in admin panel
```
Field: "Google Maps Link"
Paste: <URL from Step 3>
```

**Step 5:** Success! ✅
```
Toast: "Coordinates extracted successfully!"
Latitude: 17.4355
Longitude: 78.4483
```

**Step 6:** Save Restaurant
```
All required fields filled
Coordinates validated
Restaurant created with location data
```

---

## ⚡ Quick Validation

### Valid Hyderabad Coordinates:
- ✅ Latitude: 17.x (between 17.0 and 18.0)
- ✅ Longitude: 78.x (between 78.0 and 79.0)

### Invalid Examples:
- ❌ Latitude: 117.x (too large)
- ❌ Longitude: 7.x (wrong region)
- ❌ Latitude: 0 (not in Hyderabad)

---

## 📱 Mobile vs Desktop

### Desktop Browser (Chrome/Firefox/Edge)
- ✅ Copy from address bar
- ✅ Right-click coordinates
- ✅ Share button
- ✅ All formats work

### Mobile Browser
- ✅ Share button → Copy link
- ⚠️ Address bar may show short URL
- 💡 Tip: Open desktop site for full URL

### Google Maps App
- ✅ Share → Copy link
- ⚠️ Creates short URL (goo.gl)
- 💡 Tip: Open link in browser, copy full URL

---

## 🆘 Troubleshooting

### "Could not extract coordinates from the link"
**Cause:** URL format not recognized or no coordinates in URL
**Fix:** 
1. Try copying full URL from address bar
2. Or right-click map → copy coordinates → paste manually

### Short URL doesn't work
**Cause:** Browser blocking URL expansion (CORS)
**Fix:**
1. Open short URL in new tab
2. Copy the full URL from address bar
3. Paste the full URL

### Coordinates seem wrong
**Cause:** Copied coordinates from wrong location
**Fix:**
1. Verify on Google Maps
2. Hyderabad should be ~17.x, 78.x
3. Check if restaurant pin is correct location

---

## ✅ Success Checklist

Before saving restaurant:
- [ ] Google Maps link pasted OR coordinates entered manually
- [ ] Success toast appeared (if using Maps link)
- [ ] Latitude field shows correct number (17.x for Hyderabad)
- [ ] Longitude field shows correct number (78.x for Hyderabad)
- [ ] All other required fields filled
- [ ] Click "Create Restaurant"

Result: ✨ Restaurant saved with accurate location coordinates!
