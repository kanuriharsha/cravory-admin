# Cravory Admin Panel - Full Stack Application

## Project Structure

```
cravory-admin/
├── backend/                 # Node.js/Express API Server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env                # Backend environment variables
├── src/                    # React Frontend
│   ├── services/
│   │   └── api.ts          # API service layer
│   ├── pages/              # Page components
│   └── ...                 # Other frontend files
└── .env                    # Frontend environment variables
```

## Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already done)
npm install

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to project root
cd ..

# Install frontend dependencies (if needed)
bun install

# Start the frontend development server
bun run dev
```

The frontend will run on `http://localhost:5173` (or similar)

## MongoDB Connection

**Database Name**: Cravory  
**Connection String**: `mongodb+srv://admin:admin@cluster0.31kaszr.mongodb.net/Cravory`

### Collections:
- `restaurants` - Restaurant data
- `orders` - Order information
- `users` - Customers and delivery partners
- `menuitems` - Menu items for restaurants
- `zones` - Delivery zones
- `complaints` - Customer complaints
- `categories` - Food categories
- `settings` - Platform settings

## Features Implemented

### ✅ Backend API
- RESTful API with Express.js
- MongoDB connection using native driver
- CRUD operations for all resources
- Status management (approve/block/toggle)
- Real-time dashboard statistics
- Search and filter capabilities
- Error handling and logging

### ✅ Frontend Integration
- API service layer for all backend calls
- Real-time data fetching
- Updated pages:
  - ✅ Dashboard (with live stats)
  - ✅ Restaurants (full CRUD)
  - Orders (TODO)
  - Customers (TODO)
  - Delivery Partners (TODO)
  - Zones (TODO)
  - Complaints (TODO)

## Environment Variables

### Backend (.env in backend/)
```env
MONGODB_URI=mongodb+srv://admin:admin@cluster0.31kaszr.mongodb.net/Cravory
PORT=5000
NODE_ENV=development
```

### Frontend (.env in root/)
```env
VITE_API_URL=http://localhost:5000/api
```

## Running Both Servers

You need TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
bun run dev
```

## API Endpoints

All endpoints are prefixed with `/api`:

- `/restaurants` - Restaurant management
- `/orders` - Order management
- `/users` - User management
- `/delivery-partners` - Delivery partner operations
- `/menuitems` - Menu item CRUD
- `/zones` - Zone management
- `/complaints` - Complaint handling
- `/categories` - Category management
- `/dashboard/stats` - Dashboard statistics
- `/settings` - Platform settings

See `backend/README.md` for detailed API documentation.

## Development Workflow

1. **Backend Changes**: Edit `backend/server.js` - server auto-reloads with nodemon
2. **Frontend Changes**: Edit files in `src/` - Vite hot-reloads automatically
3. **API Updates**: Modify `src/services/api.ts` to add new endpoints

## Testing

### Test Backend Connection
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status": "OK", "message": "Server is running"}
```

### Test MongoDB Connection
Check backend console for:
```
✅ Connected to MongoDB successfully
🚀 Server running on http://localhost:5000
```

## Troubleshooting

### Backend won't start
- Ensure MongoDB connection string is correct
- Check if port 5000 is available
- Verify all dependencies are installed: `cd backend && npm install`

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `.env` file has `VITE_API_URL=http://localhost:5000/api`
- Restart frontend dev server after changing `.env`

### CORS errors
- Backend has CORS enabled for all origins
- Check browser console for specific error messages

## Next Steps

Continue updating remaining pages:
- [ ] Orders page with API integration
- [ ] Customers page with API integration
- [ ] Delivery Partners page with API integration
- [ ] Zones page with API integration
- [ ] Complaints page with API integration
- [ ] Settings page with API integration

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in backend/.env
2. Use a process manager like PM2
3. Set up proper MongoDB connection with authentication

### Frontend
1. Build: `bun run build`
2. Deploy `dist/` folder to hosting service
3. Update `VITE_API_URL` to production backend URL
