import { Restaurant, MenuItem, Order, User, DeliveryPartner, Zone, Complaint, Category, DashboardStats, SystemSettings } from '@/types/admin';

export const mockDashboardStats: DashboardStats = {
  total_restaurants: 24,
  active_orders: 156,
  delivery_partners: 45,
  open_complaints: 8,
  total_revenue: 125750,
  total_customers: 3420
};

export const mockRestaurants: Restaurant[] = [
  {
    _id: '6970a1625d5b93cf93d736c4',
    name: 'Spice Kitchen',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    rating: 4.5,
    cuisine: 'North Indian, Chinese',
    delivery_time: '30-35 mins',
    is_open: true,
    distance: '2.5 km',
    location: {
      address: '123 Food Street, Sector 15',
      city: 'Hyderabad'
    },
    zone: 'zone_1',
    operating_hours: { open: '10:00', close: '22:00' },
    status: 'approved',
    created_at: '2026-01-21T09:50:26.504+00:00'
  },
  {
    _id: '6970a1625d5b93cf93d736c5',
    name: 'Pizza Paradise',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    rating: 4.3,
    cuisine: 'Italian, Pizza',
    delivery_time: '25-30 mins',
    is_open: true,
    distance: '1.8 km',
    location: {
      address: '456 Main Road, Banjara Hills',
      city: 'Hyderabad'
    },
    zone: 'zone_2',
    operating_hours: { open: '11:00', close: '23:00' },
    status: 'approved',
    created_at: '2026-01-20T08:30:00.000+00:00'
  },
  {
    _id: '6970a1625d5b93cf93d736c6',
    name: 'Biryani House',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    rating: 4.7,
    cuisine: 'Biryani, Mughlai',
    delivery_time: '40-45 mins',
    is_open: false,
    distance: '3.2 km',
    location: {
      address: '789 Old City Road',
      city: 'Hyderabad'
    },
    zone: 'zone_1',
    operating_hours: { open: '12:00', close: '22:30' },
    status: 'approved',
    created_at: '2026-01-19T12:00:00.000+00:00'
  },
  {
    _id: '6970a1625d5b93cf93d736c7',
    name: 'Fresh Bites',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    rating: 4.1,
    cuisine: 'Healthy, Salads',
    delivery_time: '20-25 mins',
    is_open: true,
    distance: '1.2 km',
    location: {
      address: '321 Green Avenue, Jubilee Hills',
      city: 'Hyderabad'
    },
    zone: 'zone_3',
    operating_hours: { open: '08:00', close: '21:00' },
    status: 'pending',
    created_at: '2026-01-22T06:00:00.000+00:00'
  },
  {
    _id: '6970a1625d5b93cf93d736c8',
    name: 'Dragon Wok',
    image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400',
    rating: 3.9,
    cuisine: 'Chinese, Thai',
    delivery_time: '35-40 mins',
    is_open: true,
    distance: '4.0 km',
    location: {
      address: '555 East Street, Madhapur',
      city: 'Hyderabad'
    },
    zone: 'zone_2',
    operating_hours: { open: '11:30', close: '23:30' },
    status: 'blocked',
    created_at: '2026-01-18T14:00:00.000+00:00'
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    _id: 'menu_1',
    restaurant_id: '6970a1625d5b93cf93d736c4',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces',
    category: 'Main Course',
    base_price: 299,
    discounted_price: 269,
    food_type: 'non-veg',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    is_available: true,
    preparation_time: '25 mins',
    tags: ['bestseller', 'spicy'],
    status: 'active',
    created_at: '2026-01-15T10:00:00.000+00:00'
  },
  {
    _id: 'menu_2',
    restaurant_id: '6970a1625d5b93cf93d736c4',
    name: 'Paneer Tikka',
    description: 'Grilled cottage cheese with aromatic spices',
    category: 'Starters',
    base_price: 199,
    food_type: 'veg',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
    is_available: true,
    preparation_time: '15 mins',
    tags: ['chef_special'],
    status: 'active',
    created_at: '2026-01-15T10:00:00.000+00:00'
  },
  {
    _id: 'menu_3',
    restaurant_id: '6970a1625d5b93cf93d736c4',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils in creamy gravy',
    category: 'Main Course',
    base_price: 179,
    food_type: 'veg',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    is_available: false,
    preparation_time: '20 mins',
    tags: [],
    status: 'blocked',
    created_at: '2026-01-14T09:00:00.000+00:00'
  },
  {
    _id: 'menu_4',
    restaurant_id: '6970a1625d5b93cf93d736c5',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh tomatoes and mozzarella',
    category: 'Pizza',
    base_price: 249,
    discounted_price: 199,
    food_type: 'veg',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
    is_available: true,
    preparation_time: '20 mins',
    tags: ['bestseller'],
    status: 'active',
    created_at: '2026-01-16T11:00:00.000+00:00'
  },
  {
    _id: 'menu_5',
    restaurant_id: '6970a1625d5b93cf93d736c5',
    name: 'Pepperoni Pizza',
    description: 'Loaded with pepperoni and cheese',
    category: 'Pizza',
    base_price: 349,
    food_type: 'non-veg',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    is_available: true,
    preparation_time: '25 mins',
    tags: ['spicy'],
    status: 'active',
    created_at: '2026-01-16T11:00:00.000+00:00'
  }
];

export const mockOrders: Order[] = [
  {
    _id: 'order_1',
    order_id: 'ORD-2026-001',
    customer: { _id: 'cust_1', name: 'Rahul Sharma', phone: '+91 9876543210', email: 'rahul@email.com' },
    restaurant: { _id: '6970a1625d5b93cf93d736c4', name: 'Spice Kitchen' },
    delivery_partner: { _id: 'dp_1', name: 'Vijay Kumar', phone: '+91 9876543211' },
    items: [
      { item_id: 'menu_1', name: 'Butter Chicken', quantity: 2, price: 538 },
      { item_id: 'menu_2', name: 'Paneer Tikka', quantity: 1, price: 199 }
    ],
    total_amount: 787,
    status: 'preparing',
    payment_method: 'online',
    payment_status: 'paid',
    delivery_address: '123 Main Street, Sector 15, Hyderabad',
    zone: 'zone_1',
    created_at: '2026-01-22T10:30:00.000+00:00',
    updated_at: '2026-01-22T10:45:00.000+00:00'
  },
  {
    _id: 'order_2',
    order_id: 'ORD-2026-002',
    customer: { _id: 'cust_2', name: 'Priya Patel', phone: '+91 9876543212', email: 'priya@email.com' },
    restaurant: { _id: '6970a1625d5b93cf93d736c5', name: 'Pizza Paradise' },
    items: [
      { item_id: 'menu_4', name: 'Margherita Pizza', quantity: 1, price: 199 },
      { item_id: 'menu_5', name: 'Pepperoni Pizza', quantity: 1, price: 349 }
    ],
    total_amount: 598,
    status: 'placed',
    payment_method: 'cod',
    payment_status: 'pending',
    delivery_address: '456 Park Avenue, Banjara Hills, Hyderabad',
    zone: 'zone_2',
    created_at: '2026-01-22T11:00:00.000+00:00',
    updated_at: '2026-01-22T11:00:00.000+00:00'
  },
  {
    _id: 'order_3',
    order_id: 'ORD-2026-003',
    customer: { _id: 'cust_3', name: 'Amit Singh', phone: '+91 9876543213', email: 'amit@email.com' },
    restaurant: { _id: '6970a1625d5b93cf93d736c6', name: 'Biryani House' },
    delivery_partner: { _id: 'dp_2', name: 'Ravi Teja', phone: '+91 9876543214' },
    items: [
      { item_id: 'menu_6', name: 'Chicken Biryani', quantity: 3, price: 897 }
    ],
    total_amount: 947,
    status: 'delivered',
    payment_method: 'online',
    payment_status: 'paid',
    delivery_address: '789 Old City Road, Hyderabad',
    zone: 'zone_1',
    created_at: '2026-01-21T18:30:00.000+00:00',
    updated_at: '2026-01-21T19:15:00.000+00:00'
  },
  {
    _id: 'order_4',
    order_id: 'ORD-2026-004',
    customer: { _id: 'cust_4', name: 'Sneha Reddy', phone: '+91 9876543215', email: 'sneha@email.com' },
    restaurant: { _id: '6970a1625d5b93cf93d736c4', name: 'Spice Kitchen' },
    items: [
      { item_id: 'menu_2', name: 'Paneer Tikka', quantity: 2, price: 398 }
    ],
    total_amount: 448,
    status: 'cancelled',
    payment_method: 'online',
    payment_status: 'failed',
    delivery_address: '321 Green Avenue, Jubilee Hills, Hyderabad',
    zone: 'zone_3',
    created_at: '2026-01-21T14:00:00.000+00:00',
    updated_at: '2026-01-21T14:30:00.000+00:00'
  }
];

export const mockUsers: User[] = [
  {
    _id: 'cust_1',
    name: 'Rahul Sharma',
    email: 'rahul@email.com',
    phone: '+91 9876543210',
    type: 'customer',
    status: 'active',
    total_orders: 15,
    created_at: '2025-12-01T10:00:00.000+00:00'
  },
  {
    _id: 'cust_2',
    name: 'Priya Patel',
    email: 'priya@email.com',
    phone: '+91 9876543212',
    type: 'customer',
    status: 'active',
    total_orders: 8,
    created_at: '2025-12-10T14:00:00.000+00:00'
  },
  {
    _id: 'cust_3',
    name: 'Amit Singh',
    email: 'amit@email.com',
    phone: '+91 9876543213',
    type: 'customer',
    status: 'blocked',
    total_orders: 3,
    created_at: '2026-01-05T09:00:00.000+00:00'
  }
];

export const mockDeliveryPartners: DeliveryPartner[] = [
  {
    _id: 'dp_1',
    name: 'Vijay Kumar',
    email: 'vijay@delivery.com',
    phone: '+91 9876543211',
    type: 'delivery_partner',
    status: 'active',
    vehicle_type: 'Bike',
    current_zone: 'zone_1',
    is_available: true,
    total_deliveries: 245,
    rating: 4.8,
    created_at: '2025-11-15T08:00:00.000+00:00'
  },
  {
    _id: 'dp_2',
    name: 'Ravi Teja',
    email: 'ravi@delivery.com',
    phone: '+91 9876543214',
    type: 'delivery_partner',
    status: 'active',
    vehicle_type: 'Bike',
    current_zone: 'zone_2',
    is_available: false,
    total_deliveries: 189,
    rating: 4.5,
    created_at: '2025-11-20T10:00:00.000+00:00'
  },
  {
    _id: 'dp_3',
    name: 'Suresh Babu',
    email: 'suresh@delivery.com',
    phone: '+91 9876543216',
    type: 'delivery_partner',
    status: 'active',
    vehicle_type: 'Scooter',
    current_zone: 'zone_3',
    is_available: true,
    total_deliveries: 312,
    rating: 4.9,
    created_at: '2025-10-01T12:00:00.000+00:00'
  }
];

export const mockZones: Zone[] = [
  {
    _id: 'zone_1',
    name: 'Sector 15 & Old City',
    city: 'Hyderabad',
    restaurants: ['6970a1625d5b93cf93d736c4', '6970a1625d5b93cf93d736c6'],
    is_active: true,
    created_at: '2025-10-01T08:00:00.000+00:00'
  },
  {
    _id: 'zone_2',
    name: 'Banjara Hills & Madhapur',
    city: 'Hyderabad',
    restaurants: ['6970a1625d5b93cf93d736c5', '6970a1625d5b93cf93d736c8'],
    is_active: true,
    created_at: '2025-10-01T08:00:00.000+00:00'
  },
  {
    _id: 'zone_3',
    name: 'Jubilee Hills',
    city: 'Hyderabad',
    restaurants: ['6970a1625d5b93cf93d736c7'],
    is_active: true,
    created_at: '2025-10-15T10:00:00.000+00:00'
  }
];

export const mockComplaints: Complaint[] = [
  {
    _id: 'complaint_1',
    ticket_id: 'TKT-2026-001',
    order_id: 'ORD-2026-003',
    customer: { _id: 'cust_3', name: 'Amit Singh', email: 'amit@email.com' },
    issue_type: 'delivery',
    description: 'Order was delivered 1 hour late',
    status: 'open',
    priority: 'high',
    admin_notes: '',
    created_at: '2026-01-21T20:00:00.000+00:00',
    updated_at: '2026-01-21T20:00:00.000+00:00'
  },
  {
    _id: 'complaint_2',
    ticket_id: 'TKT-2026-002',
    order_id: 'ORD-2026-004',
    customer: { _id: 'cust_4', name: 'Sneha Reddy', email: 'sneha@email.com' },
    issue_type: 'payment',
    description: 'Payment was deducted but order was cancelled',
    status: 'in_progress',
    priority: 'high',
    admin_notes: 'Checking with payment gateway',
    created_at: '2026-01-21T15:00:00.000+00:00',
    updated_at: '2026-01-22T09:00:00.000+00:00'
  },
  {
    _id: 'complaint_3',
    ticket_id: 'TKT-2026-003',
    order_id: 'ORD-2026-001',
    customer: { _id: 'cust_1', name: 'Rahul Sharma', email: 'rahul@email.com' },
    issue_type: 'food_quality',
    description: 'Food was cold when delivered',
    status: 'resolved',
    priority: 'medium',
    admin_notes: 'Issued 20% refund',
    resolution: 'Partial refund processed',
    created_at: '2026-01-20T18:00:00.000+00:00',
    updated_at: '2026-01-21T10:00:00.000+00:00'
  }
];

export const mockCategories: Category[] = [
  { _id: 'cat_1', name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200', is_active: true, created_at: '2025-10-01T08:00:00.000+00:00' },
  { _id: 'cat_2', name: 'Pizza', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200', is_active: true, created_at: '2025-10-01T08:00:00.000+00:00' },
  { _id: 'cat_3', name: 'North Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200', is_active: true, created_at: '2025-10-01T08:00:00.000+00:00' },
  { _id: 'cat_4', name: 'Chinese', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=200', is_active: true, created_at: '2025-10-01T08:00:00.000+00:00' },
  { _id: 'cat_5', name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200', is_active: false, created_at: '2025-10-01T08:00:00.000+00:00' }
];

export const mockSystemSettings: SystemSettings = {
  cash_on_delivery: true,
  online_payments: true,
  new_restaurant_onboarding: true,
  minimum_order_amount: 100,
  delivery_fee: 30,
  tax_percentage: 5
};
