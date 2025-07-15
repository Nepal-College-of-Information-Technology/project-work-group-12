const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('tabletap_token')
  }

 private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${this.baseURL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (options.method === 'POST' && options.body && typeof options.body === 'string') {
    try {
      console.log('API request payload:', JSON.stringify(JSON.parse(options.body), null, 2));
    } catch (e) {
      console.log('API request payload (non-JSON):', options.body);
    }
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

  setToken(token: string) {
    this.token = token
    localStorage.setItem('tabletap_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('tabletap_token')
  }

  // Auth endpoints
  async login(email: string, password: string, tableId: string) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, tableId }),
    })
    
    if (response.data?.token) {
      this.setToken(response.data.token)
    }
    
    return response
  }

  async register(userData: any) {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    if (response.data?.token) {
      this.setToken(response.data.token)
    }
    
    return response
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me')
  }

  async updateProfile(profileData: any) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async logout() {
    try {
      await this.request<any>('/auth/logout', { method: 'POST' })
    } finally {
      this.clearToken()
    }
  }

  // Menu endpoints
  async getMenuItems(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/menu${queryString}`)
  }

  async getMenuItem(id: string) {
    return this.request<any>(`/menu/${id}`)
  }

  async createMenuItem(menuItemData: any) {
    return this.request<any>('/menu', {
      method: 'POST',
      body: JSON.stringify(menuItemData),
    })
  }

  async updateMenuItem(id: string, menuItemData: any) {
    return this.request<any>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuItemData),
    })
  }

  async toggleMenuItemAvailability(id: string, isAvailable: boolean) {
    return this.request<any>(`/menu/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    })
  }

  // Order endpoints
  async createOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrders(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/orders${queryString}`)
  }

  async getMyOrders(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/orders/my-orders${queryString}`)
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`)
  }

  async updateOrderStatus(id: string, statusData: any) {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    })
  }

  async cancelOrder(id: string) {
    return this.request<any>(`/orders/${id}`, {
      method: 'DELETE',
    })
  }

  // Table endpoints
  async getTables(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/tables${queryString}`)
  }

  async getTable(id: string) {
    return this.request<any>(`/tables/${id}`)
  }

  async getTableByQR(qrCode: string) {
    return this.request<any>(`/tables/qr/${qrCode}`)
  }

  async createTable(tableData: any) {
    return this.request<any>('/tables', {
      method: 'POST',
      body: JSON.stringify(tableData),
    })
  }

  async updateTable(id: string, tableData: any) {
    return this.request<any>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tableData),
    })
  }

  async updateTableStatus(id: string, status: string) {
    return this.request<any>(`/tables/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Notification endpoints
  async getNotifications(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/notifications${queryString}`)
  }

  async createNotification(notificationData: any) {
    return this.request<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    })
  }

  async markNotificationAsRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsAsRead() {
    return this.request<any>('/notifications/read-all', {
      method: 'PATCH',
    })
  }

  async sendCustomNotification(notificationData: any) {
    return this.request<any>('/notifications/custom', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    })
  }

  // Analytics endpoints
  async getDashboardAnalytics(period?: string) {
    const queryString = period ? `?period=${period}` : ''
    return this.request<any>(`/analytics/dashboard${queryString}`)
  }

  async getSalesAnalytics(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/analytics/sales${queryString}`)
  }

  async getMenuPerformance(period?: string) {
    const queryString = period ? `?period=${period}` : ''
    return this.request<any>(`/analytics/menu-performance${queryString}`)
  }

  async getCustomerAnalytics(period?: string) {
    const queryString = period ? `?period=${period}` : ''
    return this.request<any>(`/analytics/customers${queryString}`)
  }

  // QR Code endpoints
  async generateQRCode(tableId: string) {
    return this.request<any>(`/qr/generate/${tableId}`, {
      method: 'POST',
    })
  }

  async getQRCode(tableId: string) {
    return this.request<any>(`/qr/${tableId}`)
  }

  async validateQRCode(qrCode: string) {
    return this.request<any>(`/qr/validate/${qrCode}`)
  }

  async generateBulkQRCodes() {
    return this.request<any>('/qr/generate-bulk', {
      method: 'POST',
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient