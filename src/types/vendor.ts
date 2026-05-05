// ==================== VENDOR SYSTEM TYPES ====================
// Completely independent from restaurant types

export interface Vendor {
  _id: string;
  vendor_name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: {
    full_address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  origin_location: string;
  origin_story: string;
  specialty_items: string[];
  category: string;
  delivery_coverage: 'regional' | 'pan_india';
  avg_dispatch_time: string;
  status: 'active' | 'blocked' | 'pending' | 'suspended';
  suspension_reason?: string;
  kyc_verified: boolean;
  authenticity_badge: boolean;
  capacity: {
    max_orders_per_day: number;
    preparation_time: string;
    packaging_type: string;
    shelf_life_awareness: boolean;
  };
  logistics: {
    shipping_regions: string[];
    dispatch_sla: string;
    courier_compatibility: string[];
  };
  performance: {
    total_orders: number;
    accepted_orders: number;
    rejected_orders: number;
    acceptance_rate: number;
    dispatch_delays: number;
    return_rate: number;
    damage_rate: number;
    rating: number;
    total_reviews: number;
    total_revenue: number;
  };
  login: {
    login_id: string;
    password: string;
    last_login?: string;
  };
  documents: {
    name: string;
    type: string;
    url: string;
    uploaded_at: string;
  }[];
  activity_logs: {
    action: string;
    timestamp: string;
    details: string;
  }[];
  priority_level: number;
  assigned_products: string[];
  image?: string;
  created_at: string;
  updated_at?: string;
}

export interface VendorProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  region_tags: string[];
  ingredients: string[];
  shelf_life: string;
  packaging_type: string;
  storage_instructions: string;
  dispatch_time: string;
  delivery_feasibility: string;
  price: number;
  discounted_price?: number;
  image: string;
  assigned_vendors: string[];
  status: 'active' | 'disabled' | 'deleted';
  created_at: string;
  updated_at?: string;
}

export type VendorOrderStatus =
  | 'placed'
  | 'auto_assigned'
  | 'vendor_accepted'
  | 'vendor_rejected'
  | 'preparing'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface VendorOrder {
  _id: string;
  order_id: string;
  vendor: {
    _id: string;
    vendor_name: string;
    origin_location: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  products: {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  status: VendorOrderStatus;
  courier_tracking_id?: string;
  courier_name?: string;
  delivery_eta?: string;
  dispatch_date?: string;
  delivered_date?: string;
  rejection_reason?: string;
  reassigned_from?: string;
  reassign_count: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at?: string;
}

export interface VendorEarning {
  _id: string;
  vendor_id: string;
  vendor_name: string;
  period: string;
  total_revenue: number;
  commission_amount: number;
  commission_rate: number;
  shipping_cost: number;
  net_earnings: number;
  payout_status: 'pending' | 'processing' | 'completed';
  payout_date?: string;
  orders_count: number;
  created_at: string;
}

export interface VendorDashboardStats {
  total_vendors: number;
  active_vendors: number;
  pending_vendors: number;
  total_products: number;
  active_orders: number;
  total_revenue: number;
  avg_rating: number;
  flagged_vendors: number;
  orders_today: number;
  dispatched_today: number;
}

export interface VendorQualityFlag {
  _id: string;
  vendor_id: string;
  vendor_name: string;
  flag_reason: string;
  metric_name: string;
  metric_value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'warning_issued';
  created_at: string;
}

// Vendor product categories
export const VENDOR_PRODUCT_CATEGORIES = [
  'Sweets',
  'Snacks',
  'Pickles',
  'Dry Fruits',
  'Spices',
  'Beverages',
  'Dairy',
  'Bakery',
  'Traditional',
  'Handmade',
  'Organic',
  'Regional Specialty',
  'Other'
] as const;

// Indian states for region filtering
export const INDIAN_REGIONS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
] as const;
