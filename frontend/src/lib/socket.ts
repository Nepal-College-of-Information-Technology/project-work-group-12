import { io, Socket } from 'socket.io-client'

class SocketManager {
  private socket: Socket | null = null
  private token: string | null = null

  connect(token: string) {
    this.token = token
    
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5173', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('🔌 Connected to TableTap server')
    })

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from TableTap server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket() {
    return this.socket
  }

  // Customer events
  joinTable(tableId: string) {
    this.socket?.emit('join_table', tableId)
  }

  requestService(type: string, tableId: string, message?: string) {
    this.socket?.emit('service_request', { type, tableId, message })
  }

  startOrderTracking(orderId: string) {
    this.socket?.emit('start_order_tracking', orderId)
  }

  stopOrderTracking(orderId: string) {
    this.socket?.emit('stop_order_tracking', orderId)
  }

  // Staff events
  updateOrderStatus(orderId: string, status: string, tableId?: string, estimatedTime?: number) {
    this.socket?.emit('order_update', { orderId, status, tableId, estimatedTime })
  }

  sendChefUpdate(orderId: string, status: string, estimatedTime?: number, tableId?: string) {
    this.socket?.emit('chef_update', { orderId, status, estimatedTime, tableId })
  }

  sendWaiterUpdate(tableId: string, status: string, message?: string) {
    this.socket?.emit('waiter_update', { tableId, status, message })
  }

  updateMenuAvailability(menuItemId: string, isAvailable: boolean, name: string) {
    this.socket?.emit('menu_availability_update', { menuItemId, isAvailable, name })
  }

  updateTableStatus(tableId: string, status: string) {
    this.socket?.emit('table_status_update', { tableId, status })
  }

  // Admin events
  sendAdminBroadcast(targetRole: string, message: string, priority: string = 'medium') {
    this.socket?.emit('admin_broadcast', { targetRole, message, priority })
  }

  // Event listeners
  onNewOrder(callback: (data: any) => void) {
    this.socket?.on('new_order', callback)
  }

  onOrderStatusUpdate(callback: (data: any) => void) {
    this.socket?.on('order_status_update', callback)
  }

  onOrderConfirmed(callback: (data: any) => void) {
    this.socket?.on('order_confirmed', callback)
  }

  onOrderReady(callback: (data: any) => void) {
    this.socket?.on('order_ready', callback)
  }

  onCustomerSeated(callback: (data: any) => void) {
    this.socket?.on('customer_seated', callback)
  }

  onServiceRequest(callback: (data: any) => void) {
    this.socket?.on('service_request', callback)
  }

  onChefUpdate(callback: (data: any) => void) {
    this.socket?.on('chef_update', callback)
  }

  onWaiterUpdate(callback: (data: any) => void) {
    this.socket?.on('waiter_update', callback)
  }

  onAdminMessage(callback: (data: any) => void) {
    this.socket?.on('admin_message', callback)
  }

  onMenuItemAvailability(callback: (data: any) => void) {
    this.socket?.on('menu_item_availability', callback)
  }

  onTableStatusUpdate(callback: (data: any) => void) {
    this.socket?.on('table_status_update', callback)
  }

  onNewNotification(callback: (data: any) => void) {
    this.socket?.on('new_notification', callback)
  }

  onCustomNotification(callback: (data: any) => void) {
    this.socket?.on('custom_notification', callback)
  }

  onOrderCancelled(callback: (data: any) => void) {
    this.socket?.on('order_cancelled', callback)
  }

  onCustomerDisconnected(callback: (data: any) => void) {
    this.socket?.on('customer_disconnected', callback)
  }

  onCustomerTyping(callback: (data: any) => void) {
    this.socket?.on('customer_typing', callback)
  }

  onCustomerStoppedTyping(callback: (data: any) => void) {
    this.socket?.on('customer_stopped_typing', callback)
  }

  // Utility methods
  removeAllListeners() {
    this.socket?.removeAllListeners()
  }

  removeListener(event: string, callback?: Function) {
    if (callback) {
      this.socket?.off(event, callback)
    } else {
      this.socket?.off(event)
    }
  }

  ping() {
    this.socket?.emit('ping')
  }

  onPong(callback: () => void) {
    this.socket?.on('pong', callback)
  }
}

export const socketManager = new SocketManager()
export default socketManager