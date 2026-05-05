// Restaurant Types
export interface Restaurant {
  _id: string;
  name: string;
  image: string;
  rating: number;
  cuisine: string;
  delivery_time: string;
  is_open: boolean;
  distance: string;
  location?: {
    address?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  zone?: string;
  operating_hours?: {
    open: string;
    close: string;
  };
  status: 'pending' | 'approved' | 'blocked';
  created_at: string;
  username?: string;
  password?: string;
}

// Menu Item Types
export interface MenuItem {
  _id: string;
  restaurant_id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  discounted_price?: number;
  food_type: 'veg' | 'non-veg';
  image: string;
  is_available: boolean;  price: number;
  is_veg: boolean;  preparation_time: string;
  tags: string[];
  status: 'active' | 'blocked' | 'deleted';
  created_at: string;
}

// Order Types
export interface Order {
  _id: string;
  order_id?: string;
  userId?: string; // Alternative field name
  restaurantId?: string; // Alternative field name
  restaurantName?: string; // Alternative field name
  customer?: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  restaurant?: {
    _id: string;
    name: string;
  };
  delivery_partner?: {
    _id: string;
    name: string;
    phone: string;
  };
  items?: {
    item_id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal?: number; // Alternative field name
  deliveryFee?: number; // Alternative field name
  tax?: number; // Alternative field name
  total?: number; // Alternative field name
  total_amount?: number;
  status: 'pending' | 'placed' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  payment_method?: 'cod' | 'upi' | 'online';
  paymentMethod?: string; // Alternative field name
  payment_status?: 'pending' | 'paid' | 'failed';
  delivery_address?: string;
  zone?: string;
  created_at?: string;
  createdAt?: string; // Alternative field name
  updated_at?: string;
  updatedAt?: string; // Alternative field name
}

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  type: 'customer' | 'delivery_partner';
  status: 'active' | 'blocked';
  total_orders?: number;
  total_deliveries?: number;
  rating?: number;
  is_available?: boolean;
  created_at: string;
  createdAt?: string; // Alternative field name
}

// Delivery Partner Types
export interface DeliveryPartner extends User {
  type: 'delivery_partner';
  vehicle_type: string;
  current_zone: string;
  is_available: boolean;
  total_deliveries: number;
  rating: number;
}

// Zone Types
export interface Zone {
  _id: string;
  name: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  restaurants: string[];
  is_active: boolean;
  created_at: string;
}

// Complaint Types
export interface Complaint {
  _id: string;
  ticket_id: string;
  order_id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  issue_type: 'delivery' | 'food_quality' | 'payment' | 'other';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  admin_notes: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  image: string;
  is_active: boolean;
  created_at: string;
}

// System Settings
export interface SystemSettings {
  cash_on_delivery: boolean;
  online_payments: boolean;
  new_restaurant_onboarding: boolean;
  minimum_order_amount: number;
  delivery_fee: number;
  tax_percentage: number;
}

// Dashboard Stats
export interface DashboardStats {
  total_restaurants: number;
  active_orders: number;
  delivery_partners: number;
  open_complaints: number;
  total_revenue: number;
  total_customers: number;
}
