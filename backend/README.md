# Cravory Admin Panel - Backend Setup

## Overview
This is the backend API server for the Cravory Admin Panel, connecting to MongoDB Atlas.

## MongoDB Connection
- **Database**: Cravory
- **Connection String**: mongodb+srv://admin:admin@cluster0.31kaszr.mongodb.net/Cravory

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account with connection credentials

## Installation

```bash
cd backend
npm install
```

## Environment Variables

The `.env` file contains:
```
MONGODB_URI=mongodb+srv://admin:admin@cluster0.31kaszr.mongodb.net/Cravory
PORT=5000
NODE_ENV=development
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get single restaurant
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant
- `PATCH /api/restaurants/:id/approve` - Approve restaurant
- `PATCH /api/restaurants/:id/block` - Block restaurant
- `PATCH /api/restaurants/:id/unblock` - Unblock restaurant
- `PATCH /api/restaurants/:id/toggle-status` - Toggle open/close

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/assign` - Assign delivery partner
- `PATCH /api/orders/:id/cancel` - Cancel order

### Users (Customers & Delivery Partners)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/block` - Block user
- `PATCH /api/users/:id/unblock` - Unblock user

### Delivery Partners
- `GET /api/delivery-partners` - Get delivery partners
- `PATCH /api/delivery-partners/:id/availability` - Toggle availability

### Menu Items
- `GET /api/menuitems` - Get menu items
- `GET /api/menuitems/:id` - Get single menu item
- `POST /api/menuitems` - Create menu item
- `PUT /api/menuitems/:id` - Update menu item
- `DELETE /api/menuitems/:id` - Delete menu item

### Zones
- `GET /api/zones` - Get all zones
- `POST /api/zones` - Create zone
- `PUT /api/zones/:id` - Update zone
- `DELETE /api/zones/:id` - Delete zone
- `PATCH /api/zones/:id/toggle` - Toggle zone status

### Complaints
- `GET /api/complaints` - Get all complaints
- `PATCH /api/complaints/:id/status` - Update complaint status

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Settings
- `GET /api/settings` - Get platform settings
- `PUT /api/settings` - Update platform settings

### Health Check
- `GET /api/health` - Check server status

## Environment variables for CORS

When deploying the backend (Render), configure allowed frontend origins:

- `FRONTEND_URL` — set this to your Vercel frontend URL (e.g. `https://cravory-admin.vercel.app`).
- `ALLOWED_ORIGINS` — optional, comma-separated list of allowed origins if you need multiple (e.g. `https://cravory-admin.vercel.app,https://cravory.vercel.app`).

The server will allow requests from `FRONTEND_URL` or any origin listed in `ALLOWED_ORIGINS`. In development the defaults include `http://localhost:8080` and `http://localhost:8081`.

## Collections in MongoDB

The following collections are used:
- `restaurants`
- `orders`
- `users`
- `menuitems`
- `zones`
- `complaints`
- `categories`
- `settings`

## Features

✅ Full CRUD operations for all resources
✅ Restaurant approval/blocking system
✅ Order management and status tracking
✅ User and delivery partner management
✅ Real-time dashboard statistics
✅ Zone-based filtering
✅ Search functionality
✅ Error handling and logging
✅ CORS enabled for frontend integration

## Testing

Test the API health:
```bash
curl http://localhost:5000/api/health
```

## Notes

- All responses are in JSON format
- MongoDB ObjectIds are automatically converted to strings
- Created timestamps are added automatically
- CORS is enabled for all origins in development mode
