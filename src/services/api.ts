// API Service Layer for MongoDB Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Restaurants
  async getRestaurants(params?: { status?: string; zone?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.zone) queryParams.append('zone', params.zone);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return this.request(`/restaurants${query ? `?${query}` : ''}`);
  }

  async getRestaurant(id: string) {
    try {
      const response = await this.request(`/restaurants/${id}`);
      console.log('API getRestaurant response:', response);
      return response;
    } catch (error) {
      console.error('API getRestaurant error:', error);
      throw error;
    }
  }

  async createRestaurant(data: any) {
    return this.request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(id: string, data: any) {
    return this.request(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRestaurant(id: string) {
    return this.request(`/restaurants/${id}`, {
      method: 'DELETE',
    });
  }

  async approveRestaurant(id: string) {
    return this.request(`/restaurants/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async blockRestaurant(id: string) {
    return this.request(`/restaurants/${id}/block`, {
      method: 'PATCH',
    });
  }

  async unblockRestaurant(id: string) {
    return this.request(`/restaurants/${id}/unblock`, {
      method: 'PATCH',
    });
  }

  async toggleRestaurantStatus(id: string, isOpen: boolean) {
    return this.request(`/restaurants/${id}/toggle-status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_open: isOpen }),
    });
  }

  // Menu Items
  async getMenuItems(restaurantId?: string) {
    return this.request(`/menuitems${restaurantId ? `?restaurant_id=${restaurantId}` : ''}`);
  }

  async getMenuItem(id: string) {
    return this.request(`/menuitems/${id}`);
  }

  async createMenuItem(data: any) {
    return this.request('/menuitems', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: any) {
    return this.request(`/menuitems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menuitems/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(params?: { status?: string; zone?: string; restaurant?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.zone) queryParams.append('zone', params.zone);
    if (params?.restaurant) queryParams.append('restaurant', params.restaurant);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async assignDeliveryPartner(orderId: string, partnerId: string) {
    return this.request(`/orders/${orderId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ delivery_partner_id: partnerId }),
    });
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // Customers/Users
  async getUsers(params?: { type?: 'customer' | 'delivery_partner'; status?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async blockUser(id: string) {
    return this.request(`/users/${id}/block`, {
      method: 'PATCH',
    });
  }

  async unblockUser(id: string) {
    return this.request(`/users/${id}/unblock`, {
      method: 'PATCH',
    });
  }

  // Delivery Partners
  async getDeliveryPartners(params?: { zone?: string; available?: boolean; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.zone) queryParams.append('zone', params.zone);
    if (params?.available !== undefined) queryParams.append('available', params.available.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return this.request(`/delivery-partners${query ? `?${query}` : ''}`);
  }

  async togglePartnerAvailability(id: string, isAvailable: boolean) {
    return this.request(`/delivery-partners/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ is_available: isAvailable }),
    });
  }

  // Zones
  async getZones() {
    return this.request('/zones');
  }

  async createZone(data: any) {
    return this.request('/zones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateZone(id: string, data: any) {
    return this.request(`/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteZone(id: string) {
    return this.request(`/zones/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleZone(id: string, isActive: boolean) {
    return this.request(`/zones/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  // Complaints
  async getComplaints(params?: { status?: string; type?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return this.request(`/complaints${query ? `?${query}` : ''}`);
  }

  async updateComplaint(id: string, data: any) {
    return this.request(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateComplaintStatus(id: string, status: string, resolution?: string) {
    return this.request(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution }),
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
