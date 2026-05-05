// Vendor API Service Layer — Completely independent from restaurant API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class VendorApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/vendor`;
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
        throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Vendor API request failed:', error);
      throw error;
    }
  }

  // ==================== VENDORS ====================

  async getVendors(params?: { status?: string; region?: string; category?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.region) queryParams.append('region', params.region);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/vendors${query ? `?${query}` : ''}`);
  }

  async getVendor(id: string) {
    return this.request(`/vendors/${id}`);
  }

  async createVendor(data: any) {
    return this.request('/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(id: string, data: any) {
    return this.request(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(id: string) {
    return this.request(`/vendors/${id}`, {
      method: 'DELETE',
    });
  }

  async approveVendor(id: string) {
    return this.request(`/vendors/${id}/approve`, { method: 'PATCH' });
  }

  async blockVendor(id: string) {
    return this.request(`/vendors/${id}/block`, { method: 'PATCH' });
  }

  async unblockVendor(id: string) {
    return this.request(`/vendors/${id}/unblock`, { method: 'PATCH' });
  }

  async suspendVendor(id: string, reason: string) {
    return this.request(`/vendors/${id}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== VENDOR PRODUCTS ====================

  async getProducts(params?: { category?: string; status?: string; vendor_id?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.vendor_id) queryParams.append('vendor_id', params.vendor_id);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleProduct(id: string, status: string) {
    return this.request(`/products/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async assignVendorsToProduct(id: string, vendorIds: string[]) {
    return this.request(`/products/${id}/assign-vendors`, {
      method: 'PATCH',
      body: JSON.stringify({ vendor_ids: vendorIds }),
    });
  }

  async removeVendorFromProduct(productId: string, vendorId: string) {
    return this.request(`/products/${productId}/remove-vendor`, {
      method: 'PATCH',
      body: JSON.stringify({ vendor_id: vendorId }),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== VENDOR ORDERS ====================

  async getOrders(params?: { status?: string; vendor_id?: string; region?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.vendor_id) queryParams.append('vendor_id', params.vendor_id);
    if (params?.region) queryParams.append('region', params.region);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string, data?: any) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...data }),
    });
  }

  async reassignOrder(id: string, newVendorId: string) {
    return this.request(`/orders/${id}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify({ new_vendor_id: newVendorId }),
    });
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== VENDOR EARNINGS ====================

  async getEarnings(params?: { vendor_id?: string; period?: string; payout_status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.vendor_id) queryParams.append('vendor_id', params.vendor_id);
    if (params?.period) queryParams.append('period', params.period);
    if (params?.payout_status) queryParams.append('payout_status', params.payout_status);

    const query = queryParams.toString();
    return this.request(`/earnings${query ? `?${query}` : ''}`);
  }

  async getVendorEarnings(vendorId: string) {
    return this.request(`/earnings/${vendorId}`);
  }

  async updatePayoutStatus(id: string, status: string) {
    return this.request(`/earnings/${id}/payout`, {
      method: 'PATCH',
      body: JSON.stringify({ payout_status: status }),
    });
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // ==================== QUALITY CONTROL ====================

  async getFlaggedVendors() {
    return this.request('/quality/flagged');
  }

  async warnVendor(vendorId: string, message: string) {
    return this.request(`/quality/warn/${vendorId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const vendorApiService = new VendorApiService();
export default vendorApiService;
