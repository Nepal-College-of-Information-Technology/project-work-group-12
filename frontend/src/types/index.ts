export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'waiter' | 'chef' | 'customer'
  avatar?: string
  tableId?: string
  isActive: boolean
  createdAt: Date
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  isAvailable: boolean
  allergens: string[]
  dietaryTags: string[]
  preparationTime: number
  customizations: Customization[]
}

export interface Customization {
  id: string
  name: string
  options: string[]
  isRequired: boolean
  additionalCost: number
}

export interface OrderItem {
  id: string
  menuItem: MenuItem
  quantity: number
  customizations: Record<string, string>
  specialInstructions?: string
  subtotal: number
}

export interface Order {
  id: string
  tableId: string
  customerId: string
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed'
  totalAmount: number
  estimatedTime?: number
  remainingTime?: number
  createdAt: Date
  updatedAt: Date
  specialInstructions?: string
}

export interface Table {
  id: string
  number: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  currentOrder?: Order
  qrCode: string
  wifiCredentials: {
    ssid: string
    password: string
  }
}

export interface Notification {
  id: string
  type: 'order_placed' | 'order_confirmed' | 'order_ready' | 'customer_seated' | 'water_request'
  message: string
  targetRole: string[]
  tableId: string
  orderId?: string
  isRead: boolean
  createdAt: Date
}

export interface Analytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  popularItems: MenuItem[]
  busyHours: number[]
  customerSatisfaction: number
}