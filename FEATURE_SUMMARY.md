# Cravory Admin Panel - Feature Summary

## 🎯 Latest Updates (January 2026)

### ✨ New Features

#### 1. 📸 Image Upload from Computer
- **What:** Upload restaurant images directly from your computer
- **Why:** No need to find and copy image URLs anymore
- **How:** Click "Choose file..." button, select image, preview appears
- **Limits:** Max 5MB, images only (JPG, PNG, GIF, WebP)
- **Storage:** Base64 encoded or URL

#### 2. 🗺️ Enhanced Google Maps Short Links
- **What:** Better support for short Maps links like `maps.app.goo.gl/xxxxx`
- **Why:** Mobile sharing creates short links by default
- **How:** System automatically extracts coordinates from short URLs
- **Fallback:** Multiple parsing patterns + helpful error messages

#### 3. 🎯 Restaurant Location with Coordinates
- **What:** Every restaurant now has GPS coordinates
- **Why:** Calculate distance between user and restaurant
- **How:** Paste Google Maps link OR enter lat/lng manually
- **Future:** Distance-based search, delivery radius checks, maps

---

## 📚 Documentation

### Quick Guides:
- **[QUICK_START_NEW_FEATURES.md](QUICK_START_NEW_FEATURES.md)** - Visual guide for new features
- **[NEW_FEATURES.md](NEW_FEATURES.md)** - Detailed technical documentation
- **[LOCATION_FEATURE.md](LOCATION_FEATURE.md)** - Complete location feature guide
- **[MAPS_URL_GUIDE.md](MAPS_URL_GUIDE.md)** - Google Maps URL format reference
- **[ADMIN_QUICK_START.md](ADMIN_QUICK_START.md)** - Admin user guide

### Technical Docs:
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Full implementation details
- **[src/lib/locationUtils.ts](src/lib/locationUtils.ts)** - Location utility functions
- **[src/test/locationUtils.test.ts](src/test/locationUtils.test.ts)** - Test suite

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- MongoDB Atlas account
- Backend server running (see Backend Setup below)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:8080`

### Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string" > .env
echo "PORT=5000" >> .env

# Start backend server
npm run dev
```

Backend runs on: `http://localhost:5000`

**MongoDB Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Cravory
```

---

## 📱 Features Overview

### Admin Dashboard
- 📊 Real-time statistics (orders, revenue, customers)
- 📈 Performance metrics
- 🎯 Quick actions

### Restaurant Management
- ✅ View all restaurants with filters
- ✅ Add/edit restaurant details
- ✅ **Upload images from computer** 📸
- ✅ **Extract coordinates from Google Maps** 🗺️
- ✅ Approve/block restaurants
- ✅ Toggle open/close status
- ✅ View detailed restaurant info
- ✅ Manage menu items

### Menu Items Management
- ✅ Full CRUD operations
- ✅ Category-based filtering
- ✅ Price management
- ✅ Availability toggle
- ✅ Image upload support

### Order Management
- ✅ View all orders with status filters
- ✅ Update order status
- ✅ Assign delivery partners
- ✅ Track order timeline
- ✅ Payment status tracking

### Customer Management
- ✅ View all customers
- ✅ Block/unblock users
- ✅ Filter by role
- ✅ Contact information
- ✅ Order history

### Delivery Partners
- ✅ View all delivery partners
- ✅ Real-time availability status
- ✅ Performance metrics
- ✅ Block/unblock partners
- ✅ Zone assignment

### Zone Management
- ✅ Create/edit zones
- ✅ Assign restaurants to zones
- ✅ Delivery coverage areas

### Complaints
- ✅ View all complaints
- ✅ Update complaint status
- ✅ Respond to customers
- ✅ Priority management

---

## 🎨 New UI Components

### Image Upload Section
```
Restaurant Image
┌────────────────────────────────┐
│    [Image Preview]     [Remove]│
└────────────────────────────────┘
┌──────────────┬────────────────┐
│Upload from PC│ Or paste URL   │
│📁 Choose...  │ https://...    │
│Max: 5MB      │                │
└──────────────┴────────────────┘
```

### Maps Link with Coordinate Extraction
```
🗺️ Google Maps Link *
┌────────────────────────────────┐
│ https://maps.app.goo.gl/xxxxx  │
└────────────────────────────────┘
🔄 Extracting coordinates...
✅ Coordinates extracted successfully!

Latitude       Longitude
┌────────────┬─────────────┐
│ 17.4435    │ 78.3772    │
└────────────┴─────────────┘
```

---

## 🔧 Technology Stack

### Frontend
- **React** 18+ with TypeScript
- **Vite** 5.4.19 - Build tool
- **TailwindCSS** - Styling
- **Shadcn/ui** - Component library
- **Lucide Icons** - Icon set
- **Sonner** - Toast notifications
- **React Router** - Navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Native Driver
- **CORS** enabled for local development

### Testing
- **Vitest** - Test framework
- **Happy DOM** - DOM testing

---

## 📂 Project Structure

```
cravory-admin/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── admin/        # Admin-specific components
│   │   └── ui/           # Shadcn UI components
│   ├── pages/            # Page components
│   │   └── admin/        # Admin pages
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   │   └── locationUtils.ts  # Location/Maps utilities
│   ├── services/         # API service layer
│   ├── types/            # TypeScript type definitions
│   └── test/             # Test files
├── backend/
│   └── server.js         # Express.js backend server
├── public/               # Static assets
└── docs/                 # Documentation (see above)
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Specific Test
```bash
npm test -- locationUtils.test.ts
```

### Test Coverage
- Location utility functions
- Coordinate extraction from Maps URLs
- Distance calculation
- Input validation

---

## 🌐 API Endpoints

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant
- `PATCH /api/restaurants/:id/approve` - Approve restaurant
- `PATCH /api/restaurants/:id/block` - Block restaurant
- `PATCH /api/restaurants/:id/status` - Toggle open/close

### Menu Items
- `GET /api/menuitems` - Get menu items (with restaurant filter)
- `POST /api/menuitems` - Create menu item
- `PUT /api/menuitems/:id` - Update menu item
- `DELETE /api/menuitems/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status

### Users (Customers & Delivery Partners)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/block` - Block user
- `PATCH /api/users/:id/unblock` - Unblock user

### Zones
- `GET /api/zones` - Get all zones
- `POST /api/zones` - Create zone
- `PUT /api/zones/:id` - Update zone
- `DELETE /api/zones/:id` - Delete zone

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint

---

## 💡 Usage Tips

### Adding a Restaurant

1. **Fill Basic Info:**
   - Name, cuisine, address, city
   - Zone selection
   - Operating hours

2. **Add Image (Choose one):**
   - **Upload:** Click "Choose file..." → Select image → Preview appears
   - **URL:** Paste image URL → Preview appears

3. **Add Location (Required):**
   - **Maps Link:** Paste Google Maps link (short or full) → Coordinates extract
   - **Manual:** Enter latitude and longitude directly

4. **Verify & Save:**
   - Check all fields filled
   - Preview looks good
   - Coordinates make sense (17.x, 78.x for Hyderabad)
   - Click "Create Restaurant"

### Google Maps Links

**Supported formats:**
- Standard: `https://www.google.com/maps/@17.385044,78.486671,15z`
- Place: `https://www.google.com/maps/place/Name/@17.385044,78.486671`
- Query: `https://www.google.com/maps?q=17.385044,78.486671`
- Short: `https://maps.app.goo.gl/xxxxx` ✨ NEW!

**Best practice:**
1. Try pasting link first
2. If extraction fails, open link in browser
3. Copy full URL from address bar
4. Or enter coordinates manually

### Image Upload

**File Requirements:**
- Type: JPG, PNG, GIF, WebP
- Size: Max 5MB
- Quality: Higher is better

**Tips:**
- Use good lighting photos
- Show food/ambiance
- Compress large images at [TinyPNG](https://tinypng.com)
- Or use image URL from web

---

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/Cravory
PORT=5000
```

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend connection error
- Check MongoDB URI in .env
- Verify MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)
- Ensure backend is running on port 5000

### Image upload fails
- Check file size (must be < 5MB)
- Verify file type (images only)
- Try URL upload instead

### Maps coordinate extraction fails
- Open short URL in browser
- Copy full URL from address bar
- Paste full URL
- Or enter coordinates manually

### TypeScript errors
```bash
# Regenerate types
npm run build
```

---

## 🚀 Deployment

### Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend
```bash
# Install dependencies
cd backend
npm install

# Set production environment variables
export MONGODB_URI=your_production_uri
export PORT=5000

# Start server
node server.js
```

---

## 📞 Support

For issues or questions:
1. Check documentation in `/docs` folder
2. Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Check browser console (F12) for errors
4. Contact development team

---

## 🎉 What's Next?

### Planned Features
- [ ] Image optimization and CDN integration
- [ ] Drag & drop image upload
- [ ] Multiple image gallery per restaurant
- [ ] Distance-based restaurant sorting
- [ ] Map view of all restaurants
- [ ] Delivery radius visualization
- [ ] Real-time order tracking map
- [ ] Analytics dashboard with charts

---

## 📄 License

[Your License Here]

---

## 👥 Contributors

[Your Team Here]

---

**Last Updated:** January 22, 2026

**Version:** 2.0.0 - Image Upload & Enhanced Maps Support

Made with ❤️ for Cravory
