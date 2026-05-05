import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
// Configure CORS to allow frontend origins (Vercel, local dev, etc.)
const FRONTEND_URL = process.env.FRONTEND_URL; // e.g. https://your-app.vercel.app
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || FRONTEND_URL || 'http://localhost:8080,http://localhost:8081').split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server or curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error('CORS policy does not allow this origin'), false);
  },
  credentials: true,
}));

// Enable preflight for all routes
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Client
let db;
let client;

// Connect to MongoDB
async function connectDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('Cravory');
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Helper function to convert MongoDB _id
const convertId = (doc) => {
  if (doc && doc._id) {
    return { ...doc, _id: doc._id.toString() };
  }
  return doc;
};

// ==================== RESTAURANTS ====================

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const { status, zone, search } = req.query;
    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (zone && zone !== 'all') query.zone = zone;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } }
      ];
    }

    const restaurants = await db.collection('restaurants')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(restaurants.map(convertId));
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single restaurant
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await db.collection('restaurants')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(convertId(restaurant));
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create restaurant
app.post('/api/restaurants', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const newRestaurant = {
      ...req.body,
      created_at: new Date().toISOString(),
      status: req.body.status || 'pending'
    };
    
    const result = await db.collection('restaurants').insertOne(newRestaurant);
    const restaurant = await db.collection('restaurants')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json(convertId(restaurant));
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update restaurant
app.put('/api/restaurants/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    
    const result = await db.collection('restaurants').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete restaurant
app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    const result = await db.collection('restaurants')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve restaurant
app.patch('/api/restaurants/:id/approve', async (req, res) => {
  try {
    const result = await db.collection('restaurants').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'approved' } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error approving restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Block restaurant
app.patch('/api/restaurants/:id/block', async (req, res) => {
  try {
    const result = await db.collection('restaurants').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'blocked' } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error blocking restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unblock restaurant
app.patch('/api/restaurants/:id/unblock', async (req, res) => {
  try {
    const result = await db.collection('restaurants').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'approved' } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error unblocking restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle restaurant open/close
app.patch('/api/restaurants/:id/toggle-status', async (req, res) => {
  try {
    const { is_open } = req.body;
    const result = await db.collection('restaurants').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { is_open } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error toggling restaurant status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== MENU ITEMS ====================

// Get menu items
app.get('/api/menuitems', async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const query = {};
    
    if (restaurant_id) query.restaurant_id = restaurant_id;

    const menuItems = await db.collection('menuitems')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(menuItems.map(convertId));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single menu item
app.get('/api/menuitems/:id', async (req, res) => {
  try {
    const menuItem = await db.collection('menuitems')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(convertId(menuItem));
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create menu item
app.post('/api/menuitems', async (req, res) => {
  try {
    const newMenuItem = {
      ...req.body,
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('menuitems').insertOne(newMenuItem);
    const menuItem = await db.collection('menuitems')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json(convertId(menuItem));
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update menu item
app.put('/api/menuitems/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    
    const result = await db.collection('menuitems').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item
app.delete('/api/menuitems/:id', async (req, res) => {
  try {
    const result = await db.collection('menuitems')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORDERS ====================

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const { status, zone, restaurant, search } = req.query;
    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (zone && zone !== 'all') query.zone = zone;
    if (restaurant && restaurant !== 'all') query['restaurant._id'] = restaurant;
    if (search) {
      query.$or = [
        { order_id: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await db.collection('orders')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(orders.map(convertId));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.collection('orders')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(convertId(order));
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status,
          updated_at: new Date().toISOString()
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign delivery partner
app.patch('/api/orders/:id/assign', async (req, res) => {
  try {
    const { delivery_partner_id } = req.body;
    
    // Get delivery partner details
    const partner = await db.collection('users')
      .findOne({ _id: new ObjectId(delivery_partner_id) });
    
    if (!partner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }
    
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          delivery_partner: {
            _id: partner._id.toString(),
            name: partner.name,
            phone: partner.phone
          },
          updated_at: new Date().toISOString()
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error assigning delivery partner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
app.patch('/api/orders/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== USERS (CUSTOMERS & DELIVERY PARTNERS) ====================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await db.collection('users')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(users.map(convertId));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(convertId(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Block user
app.patch('/api/users/:id/block', async (req, res) => {
  try {
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'blocked' } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unblock user
app.patch('/api/users/:id/unblock', async (req, res) => {
  try {
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'active' } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DELIVERY PARTNERS ====================

// Get delivery partners
app.get('/api/delivery-partners', async (req, res) => {
  try {
    const { zone, available, status } = req.query;
    const query = { type: 'delivery_partner' };
    
    if (zone && zone !== 'all') query.current_zone = zone;
    if (available !== undefined) query.is_available = available === 'true';
    if (status && status !== 'all') query.status = status;

    const partners = await db.collection('users')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(partners.map(convertId));
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle partner availability
app.patch('/api/delivery-partners/:id/availability', async (req, res) => {
  try {
    const { is_available } = req.body;
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { is_available } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error toggling partner availability:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ZONES ====================

// Get all zones
app.get('/api/zones', async (req, res) => {
  try {
    const zones = await db.collection('zones')
      .find({})
      .sort({ name: 1 })
      .toArray();
    
    res.json(zones.map(convertId));
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create zone
app.post('/api/zones', async (req, res) => {
  try {
    const newZone = {
      ...req.body,
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('zones').insertOne(newZone);
    const zone = await db.collection('zones')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json(convertId(zone));
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update zone
app.put('/api/zones/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    
    const result = await db.collection('zones').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete zone
app.delete('/api/zones/:id', async (req, res) => {
  try {
    const result = await db.collection('zones')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    
    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle zone status
app.patch('/api/zones/:id/toggle', async (req, res) => {
  try {
    const { is_active } = req.body;
    const result = await db.collection('zones').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { is_active } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error toggling zone status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== COMPLAINTS ====================

// Get all complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.complaint_type = type;
    if (search) {
      query.$or = [
        { complaint_id: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await db.collection('complaints')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(complaints.map(convertId));
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update complaint status
app.patch('/api/complaints/:id/status', async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (resolution) {
      updateData.resolution = resolution;
      updateData.resolved_at = new Date().toISOString();
    }
    
    const result = await db.collection('complaints').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CATEGORIES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.collection('categories')
      .find({})
      .sort({ name: 1 })
      .toArray();
    
    res.json(categories.map(convertId));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', async (req, res) => {
  try {
    const newCategory = {
      ...req.body,
      created_at: new Date().toISOString()
    };
    
    const result = await db.collection('categories').insertOne(newCategory);
    const category = await db.collection('categories')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json(convertId(category));
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    
    const result = await db.collection('categories').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const result = await db.collection('categories')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD ====================

// Get dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [
      totalRestaurants,
      activeOrders,
      deliveryPartners,
      openComplaints,
      totalCustomers
    ] = await Promise.all([
      db.collection('restaurants').countDocuments(),
      db.collection('orders').countDocuments({ 
        status: { $nin: ['delivered', 'cancelled'] } 
      }),
      db.collection('users').countDocuments({ type: 'delivery_partner' }),
      db.collection('complaints').countDocuments({ status: 'open' }),
      db.collection('users').countDocuments({ type: 'customer' })
    ]);
    
    // Calculate total revenue
    const revenueResult = await db.collection('orders').aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]).toArray();
    
    const totalRevenue = revenueResult[0]?.total || 0;
    
    res.json({
      total_restaurants: totalRestaurants,
      active_orders: activeOrders,
      delivery_partners: deliveryPartners,
      open_complaints: openComplaints,
      total_revenue: totalRevenue,
      total_customers: totalCustomers
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SETTINGS ====================

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await db.collection('settings').findOne({});
    
    if (!settings) {
      // Create default settings if not found
      settings = {
        platform_name: 'Cravory',
        support_email: 'support@cravory.com',
        support_phone: '+91-1234567890',
        commission_rate: 15,
        delivery_charges: {
          base: 30,
          per_km: 10
        },
        min_order_value: 100,
        max_delivery_distance: 10,
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      };
      await db.collection('settings').insertOne(settings);
    }
    
    res.json(convertId(settings));
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update settings
app.put('/api/settings', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    
    const result = await db.collection('settings').findOneAndUpdate(
      {},
      { $set: updateData },
      { returnDocument: 'after', upsert: true }
    );
    
    res.json(convertId(result));
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
});

<<<<<<< HEAD
// ==================== VENDOR SYSTEM (Authentic Foods) ====================
// Completely independent from restaurant system
// Uses separate collections: vendors, vendor_products, vendor_orders, vendor_earnings

// Helper: generate vendor login credentials
function generateVendorCredentials(vendorName) {
  const id = vendorName.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
  const pass = 'V' + Math.random().toString(36).substring(2, 10) + '!';
  return { login_id: id, password: pass };
}

// ---- VENDORS ----

app.get('/api/vendor/vendors', async (req, res) => {
  try {
    const { status, region, category, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (region && region !== 'all') query['address.state'] = region;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { vendor_name: { $regex: search, $options: 'i' } },
        { origin_location: { $regex: search, $options: 'i' } },
        { specialty_items: { $regex: search, $options: 'i' } },
      ];
    }
    const vendors = await db.collection('vendors').find(query).sort({ created_at: -1 }).toArray();
    res.json(vendors.map(convertId));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/vendor/vendors/:id', async (req, res) => {
  try {
    const vendor = await db.collection('vendors').findOne({ _id: new ObjectId(req.params.id) });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(convertId(vendor));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/vendor/vendors', async (req, res) => {
  try {
    const creds = generateVendorCredentials(req.body.vendor_name || 'vendor');
    const newVendor = {
      ...req.body,
      status: 'pending',
      kyc_verified: false,
      authenticity_badge: false,
      performance: { total_orders: 0, accepted_orders: 0, rejected_orders: 0, acceptance_rate: 1, dispatch_delays: 0, return_rate: 0, damage_rate: 0, rating: 0, total_reviews: 0, total_revenue: 0 },
      login: { login_id: creds.login_id, password: creds.password },
      documents: [],
      activity_logs: [{ action: 'Vendor account created', timestamp: new Date().toISOString(), details: 'Created by admin' }],
      priority_level: 5,
      assigned_products: [],
      created_at: new Date().toISOString(),
    };
    const result = await db.collection('vendors').insertOne(newVendor);
    const vendor = await db.collection('vendors').findOne({ _id: result.insertedId });
    res.status(201).json(convertId(vendor));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/vendor/vendors/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    updateData.updated_at = new Date().toISOString();
    const result = await db.collection('vendors').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: updateData }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Vendor not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/vendor/vendors/:id', async (req, res) => {
  try {
    const result = await db.collection('vendors').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/vendors/:id/approve', async (req, res) => {
  try {
    const result = await db.collection('vendors').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { status: 'active', updated_at: new Date().toISOString() }, $push: { activity_logs: { action: 'Vendor approved', timestamp: new Date().toISOString(), details: 'Approved by admin' } } }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Vendor not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/vendors/:id/block', async (req, res) => {
  try {
    const result = await db.collection('vendors').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { status: 'blocked', updated_at: new Date().toISOString() }, $push: { activity_logs: { action: 'Vendor blocked', timestamp: new Date().toISOString(), details: 'Blocked by admin' } } }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Vendor not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/vendors/:id/unblock', async (req, res) => {
  try {
    const result = await db.collection('vendors').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { status: 'active', updated_at: new Date().toISOString() }, $push: { activity_logs: { action: 'Vendor unblocked', timestamp: new Date().toISOString(), details: 'Unblocked by admin' } } }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Vendor not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/vendors/:id/suspend', async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await db.collection('vendors').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { status: 'suspended', suspension_reason: reason, updated_at: new Date().toISOString() }, $push: { activity_logs: { action: 'Vendor suspended', timestamp: new Date().toISOString(), details: reason } } }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Vendor not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---- VENDOR PRODUCTS ----

app.get('/api/vendor/products', async (req, res) => {
  try {
    const { category, status, vendor_id, search } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (vendor_id) query.assigned_vendors = vendor_id;
    if (search) { query.$or = [{ name: { $regex: search, $options: 'i' } }, { category: { $regex: search, $options: 'i' } }]; }
    const products = await db.collection('vendor_products').find(query).sort({ created_at: -1 }).toArray();
    res.json(products.map(convertId));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/vendor/products/:id', async (req, res) => {
  try {
    const product = await db.collection('vendor_products').findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(convertId(product));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/vendor/products', async (req, res) => {
  try {
    const newProduct = { ...req.body, assigned_vendors: req.body.assigned_vendors || [], status: 'active', created_at: new Date().toISOString() };
    const result = await db.collection('vendor_products').insertOne(newProduct);
    const product = await db.collection('vendor_products').findOne({ _id: result.insertedId });
    res.status(201).json(convertId(product));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/vendor/products/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    updateData.updated_at = new Date().toISOString();
    const result = await db.collection('vendor_products').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: updateData }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/products/:id/toggle', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.collection('vendor_products').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { status, updated_at: new Date().toISOString() } }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/products/:id/assign-vendors', async (req, res) => {
  try {
    const { vendor_ids } = req.body;
    const result = await db.collection('vendor_products').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { assigned_vendors: vendor_ids, updated_at: new Date().toISOString() } }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/products/:id/remove-vendor', async (req, res) => {
  try {
    const { vendor_id } = req.body;
    const result = await db.collection('vendor_products').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $pull: { assigned_vendors: vendor_id }, $set: { updated_at: new Date().toISOString() } }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/vendor/products/:id', async (req, res) => {
  try {
    const result = await db.collection('vendor_products').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---- VENDOR ORDERS ----

app.get('/api/vendor/orders', async (req, res) => {
  try {
    const { status, vendor_id, region, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (vendor_id && vendor_id !== 'all') query['vendor._id'] = vendor_id;
    if (region && region !== 'all') query['vendor.origin_location'] = { $regex: region, $options: 'i' };
    if (search) { query.$or = [{ order_id: { $regex: search, $options: 'i' } }, { 'customer.name': { $regex: search, $options: 'i' } }, { 'vendor.vendor_name': { $regex: search, $options: 'i' } }]; }
    const orders = await db.collection('vendor_orders').find(query).sort({ created_at: -1 }).toArray();
    res.json(orders.map(convertId));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/vendor/orders/:id', async (req, res) => {
  try {
    const order = await db.collection('vendor_orders').findOne({ _id: new ObjectId(req.params.id) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(convertId(order));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/vendor/orders', async (req, res) => {
  try {
    const orderId = 'VO-' + Date.now().toString(36).toUpperCase();
    const newOrder = { ...req.body, order_id: orderId, status: 'placed', reassign_count: 0, payment_status: 'pending', created_at: new Date().toISOString() };
    const result = await db.collection('vendor_orders').insertOne(newOrder);
    const order = await db.collection('vendor_orders').findOne({ _id: result.insertedId });
    res.status(201).json(convertId(order));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/orders/:id/status', async (req, res) => {
  try {
    const { status, courier_tracking_id, courier_name, delivery_eta } = req.body;
    const updateData = { status, updated_at: new Date().toISOString() };
    if (courier_tracking_id) updateData.courier_tracking_id = courier_tracking_id;
    if (courier_name) updateData.courier_name = courier_name;
    if (delivery_eta) updateData.delivery_eta = delivery_eta;
    if (status === 'dispatched') updateData.dispatch_date = new Date().toISOString();
    if (status === 'delivered') updateData.delivered_date = new Date().toISOString();
    const result = await db.collection('vendor_orders').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: updateData }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Order not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/orders/:id/reassign', async (req, res) => {
  try {
    const { new_vendor_id } = req.body;
    const newVendor = await db.collection('vendors').findOne({ _id: new ObjectId(new_vendor_id) });
    if (!newVendor) return res.status(404).json({ error: 'New vendor not found' });
    const order = await db.collection('vendor_orders').findOne({ _id: new ObjectId(req.params.id) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const result = await db.collection('vendor_orders').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { vendor: { _id: new_vendor_id, vendor_name: newVendor.vendor_name, origin_location: newVendor.origin_location }, reassigned_from: order.vendor?._id, status: 'auto_assigned', updated_at: new Date().toISOString() }, $inc: { reassign_count: 1 } },
      { returnDocument: 'after' }
    );
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/orders/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await db.collection('vendor_orders').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { status: 'cancelled', rejection_reason: reason, updated_at: new Date().toISOString() } }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Order not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---- VENDOR EARNINGS ----

app.get('/api/vendor/earnings', async (req, res) => {
  try {
    const { vendor_id, period, payout_status } = req.query;
    const query = {};
    if (vendor_id) query.vendor_id = vendor_id;
    if (period) query.period = period;
    if (payout_status && payout_status !== 'all') query.payout_status = payout_status;
    const earnings = await db.collection('vendor_earnings').find(query).sort({ created_at: -1 }).toArray();
    res.json(earnings.map(convertId));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/vendor/earnings/:vendorId', async (req, res) => {
  try {
    const earnings = await db.collection('vendor_earnings').find({ vendor_id: req.params.vendorId }).sort({ created_at: -1 }).toArray();
    res.json(earnings.map(convertId));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/vendor/earnings/:id/payout', async (req, res) => {
  try {
    const { payout_status } = req.body;
    const updateData = { payout_status };
    if (payout_status === 'completed') updateData.payout_date = new Date().toISOString();
    const result = await db.collection('vendor_earnings').findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: updateData }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'Earning record not found' });
    res.json(convertId(result));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---- VENDOR DASHBOARD STATS ----

app.get('/api/vendor/dashboard/stats', async (req, res) => {
  try {
    const [totalVendors, activeVendors, pendingVendors, totalProducts, activeOrders] = await Promise.all([
      db.collection('vendors').countDocuments(),
      db.collection('vendors').countDocuments({ status: 'active' }),
      db.collection('vendors').countDocuments({ status: 'pending' }),
      db.collection('vendor_products').countDocuments({ status: 'active' }),
      db.collection('vendor_orders').countDocuments({ status: { $nin: ['delivered', 'cancelled', 'returned'] } }),
    ]);
    const revenueResult = await db.collection('vendor_orders').aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$total_amount' } } }]).toArray();
    const totalRevenue = revenueResult[0]?.total || 0;
    const ratingResult = await db.collection('vendors').aggregate([{ $match: { status: 'active', 'performance.rating': { $gt: 0 } } }, { $group: { _id: null, avg: { $avg: '$performance.rating' } } }]).toArray();
    const avgRating = ratingResult[0]?.avg || 0;
    const flaggedVendors = await db.collection('vendors').countDocuments({
      $or: [{ 'performance.acceptance_rate': { $lt: 0.7 } }, { 'performance.return_rate': { $gt: 0.1 } }, { 'performance.rating': { $lt: 3, $gt: 0 } }]
    });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const ordersToday = await db.collection('vendor_orders').countDocuments({ created_at: { $gte: today.toISOString() } });
    const dispatchedToday = await db.collection('vendor_orders').countDocuments({ dispatch_date: { $gte: today.toISOString() } });
    res.json({ total_vendors: totalVendors, active_vendors: activeVendors, pending_vendors: pendingVendors, total_products: totalProducts, active_orders: activeOrders, total_revenue: totalRevenue, avg_rating: avgRating, flagged_vendors: flaggedVendors, orders_today: ordersToday, dispatched_today: dispatchedToday });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---- QUALITY CONTROL ----

app.get('/api/vendor/quality/flagged', async (req, res) => {
  try {
    const flagged = await db.collection('vendors').find({
      $or: [{ 'performance.acceptance_rate': { $lt: 0.7 } }, { 'performance.return_rate': { $gt: 0.1 } }, { 'performance.rating': { $lt: 3, $gt: 0 } }, { 'performance.dispatch_delays': { $gt: 5 } }]
    }).sort({ 'performance.rating': 1 }).toArray();
    res.json(flagged.map(convertId));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/vendor/quality/warn/:vendorId', async (req, res) => {
  try {
    const { message } = req.body;
    const result = await db.collection('vendors').findOneAndUpdate(
      { _id: new ObjectId(req.params.vendorId) },
      { $push: { activity_logs: { action: 'Warning issued', timestamp: new Date().toISOString(), details: message } } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ message: 'Warning sent successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==================== END VENDOR SYSTEM ====================

=======
>>>>>>> 9eefa165519f5b993ddde62d369f864c278b0196
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await client.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});
