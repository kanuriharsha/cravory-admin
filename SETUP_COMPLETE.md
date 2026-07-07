# Cravory Admin - MongoDB Backend Integration

## ✅ Completed Setup

### Backend Infrastructure
- ✅ Express.js API server connected to MongoDB Atlas
- ✅ Database: `mongodb+srv://admin:admin@cluster0.31kaszr.mongodb.net/Cravory`
- ✅ Port: 5000
- ✅ All RESTful endpoints configured

### Frontend Pages Updated with Backend API
- ✅ **Dashboard** - Real-time statistics from MongoDB
- ✅ **Restaurants** - Full CRUD operations
- ✅ **Orders** - Order management with filtering
- ✅ **Customers** - User management
- ✅ **Delivery Partners** - Partner management with availability toggle

### API Features Implemented
- ✅ Restaurant management (approve, block, toggle status)
- ✅ Order tracking and status updates
- ✅ Delivery partner assignment
- ✅ User blocking/unblocking
- ✅ Search and filter functionality
- ✅ Real-time data updates
- ✅ Error handling and loading states

## 🚀 How to Run

### Option 1: Using the batch file (Windows)
```bash
# Start backend
.\start-backend.bat

# In a new terminal, start frontend
bun run dev
```

### Option 2: Manual start
**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
bun run dev
```

## 📊 MongoDB Collections in Use

Your MongoDB database contains:
- `restaurants` - Restaurant data
- `orders` - Order information  
- `users` - Customers and delivery partners
- `menuitems` - Menu items
- `zones` - Delivery zones
- `complaints` - Customer complaints
- `categories` - Food categories
- `settings` - Platform settings

## 🔌 API Endpoints Summary

### Restaurants (`/api/restaurants`)
- GET - List all restaurants
- POST - Create restaurant
- PUT - Update restaurant
- DELETE - Delete restaurant
- PATCH `/approve`, `/block`, `/unblock`, `/toggle-status`

### Orders (`/api/orders`)
- GET - List all orders
- PATCH `/:id/status` - Update order status
- PATCH `/:id/assign` - Assign delivery partner
- PATCH `/:id/cancel` - Cancel order

### Users (`/api/users`)
- GET - List users (customers & partners)
- PUT - Update user
- PATCH `/block`, `/unblock`

### Delivery Partners (`/api/delivery-partners`)
- GET - List delivery partners
- PATCH `/:id/availability` - Toggle availability

### Dashboard (`/api/dashboard/stats`)
- GET - Get dashboard statistics

### Other Collections
- `/api/zones` - Zone management
- `/api/complaints` - Complaint handling
- `/api/categories` - Category CRUD
- `/api/settings` - Platform settings

## 📝 Environment Variables

**Backend (.env in backend/):**
```env
MONGODB_URI=mongodb+srv://admin:admin@cluster0.31kaszr.mongodb.net/Cravory
PORT=5000
NODE_ENV=development
```

**Frontend (.env in root/):**
```env
VITE_API_URL=http://localhost:5000/api
```

## ✨ Key Features Working

1. **Real-time Data**: All pages fetch live data from MongoDB
2. **CRUD Operations**: Create, Read, Update, Delete functionality
3. **Status Management**: Approve/block restaurants, update order statuses
4. **Search & Filter**: Dynamic filtering across all resources
5. **Loading States**: Proper loading indicators
6. **Error Handling**: Toast notifications for success/error
7. **Data Refresh**: Auto-refresh after operations

## 🔧 Technical Stack

**Backend:**
- Node.js + Express.js
- MongoDB Native Driver
- CORS enabled
- Environment variables with dotenv

**Frontend:**
- React + TypeScript
- Vite
- TanStack Query (ready to integrate)
- Shadcn UI components
- Custom API service layer

## 🎯 Current Status

**Backend:** ✅ Running on http://localhost:5000
**Frontend:** ⏳ Ready to start with `bun run dev`
**MongoDB:** ✅ Connected and operational
**API Integration:** ✅ Complete for main pages

## 📦 Next Steps (Optional Enhancements)

- [ ] Add pagination for large datasets
- [ ] Implement real-time updates with WebSockets
- [ ] Add authentication/authorization
- [ ] Create data analytics and reports
- [ ] Add image upload functionality
- [ ] Implement caching strategies
- [ ] Add API rate limiting
- [ ] Create API documentation with Swagger

## 🐛 Troubleshooting

**Backend won't connect to MongoDB:**
- Check internet connection
- Verify MongoDB Atlas is accessible
- Confirm connection string is correct

**Frontend can't reach backend:**
- Ensure backend is running on port 5000
- Check .env file has correct API URL
- Restart frontend dev server after .env changes

**Data not loading:**
- Check browser console for errors
- Verify MongoDB has data in collections
- Check network tab for API responses

## 📚 Documentation

- Full API docs: `backend/README.md`
- Project setup: `README_FULLSTACK.md`
- Original README: `README.md`

---

**Project Status:** 🟢 Fully Operational
**Last Updated:** January 22, 2026
