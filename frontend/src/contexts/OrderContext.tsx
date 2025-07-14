import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
import { socketManager } from '../lib/socket';
import { Order, OrderItem, MenuItem, Notification } from '../types';

interface OrderContextType {
  orders: Order[];
  notifications: Notification[];
  addToOrder: (item: MenuItem, customizations: Record<string, string>, specialInstructions?: string) => void;
  removeFromOrder: (itemId: string) => void;
  submitOrder: (tableId: string, customerId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], estimatedTime?: number) => void;
  currentOrder: OrderItem[];
  clearOrder: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}

interface OrderProviderProps {
  children: ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem('tabletap_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  const addToOrder = (item: MenuItem, customizations: Record<string, string>, specialInstructions?: string) => {
    console.log('Adding to order:', { item, customizations, specialInstructions });
    const cleanedCustomizations: Record<string, string> = {};
    for (const [key, value] of Object.entries(customizations || {})) {
      if (key !== 'undefined' && key) {
        cleanedCustomizations[key] = value;
      } else {
        console.warn(`Invalid customization key: ${key}, value: ${value}`);
      }
    }
    if (Object.keys(cleanedCustomizations).length === 0 && Object.keys(customizations || {}).length > 0) {
      console.warn('All customizations were invalid and removed:', customizations);
    }

    const orderItem: OrderItem = {
      id: Date.now().toString(),
      menuItem: item,
      quantity: 1,
      customizations: cleanedCustomizations,
      specialInstructions: specialInstructions || '',
      subtotal: item.price
    };
    setCurrentOrder(prev => [...prev, orderItem]);
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const submitOrder = async (tableId: string, customerId: string) => {
    if (!currentOrder || !Array.isArray(currentOrder) || currentOrder.length === 0) {
      throw new Error('No valid order items to submit');
    }

    const orderItems = currentOrder.map((item, index) => {
      if (!item.menuItem || !item.menuItem._id) {
        throw new Error(`Invalid order item at index ${index}: missing menuItem._id`);
      }
      return {
        menuItem: item.menuItem._id,
        quantity: item.quantity,
        customizations: item.customizations || {},
        specialInstructions: item.specialInstructions || ''
      };
    });

    const orderData = {
      tableId,
      items: orderItems,
      specialInstructions: ''
    };

    console.log('Submitting order payload:', JSON.stringify(orderData, null, 2));

    try {
      const response = await apiClient.createOrder(orderData);
      const newOrder = response.data.order;
      setOrders(prev => {
        const updated = [...prev, newOrder];
        localStorage.setItem('tabletap_orders', JSON.stringify(updated));
        return updated;
      });
      setCurrentOrder([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit order';
      throw new Error(errorMessage);
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], estimatedTime?: number) => {
    setOrders(prev => {
      const updated = prev.map(order =>
        order.id === orderId
          ? { ...order, status, estimatedTime, remainingTime: estimatedTime, updatedAt: new Date() }
          : order
      );
      localStorage.setItem('tabletap_orders', JSON.stringify(updated));
      return updated;
    });

    const order = orders.find(o => o.id === orderId);
    if (order) {
      socketManager.updateOrderStatus(orderId, status, order.tableId, estimatedTime);
    }

    if (status === 'confirmed' && estimatedTime) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        addNotification({
          type: 'order_confirmed',
          message: `Order confirmed for ${order.tableId}. Estimated time: ${estimatedTime} minutes`,
          targetRole: ['customer'],
          tableId: order.tableId,
          orderId,
          isRead: false
        });
      }
    }

    if (status === 'ready') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        addNotification({
          type: 'order_ready',
          message: `Order ready for ${order.tableId}`,
          targetRole: ['waiter'],
          tableId: order.tableId,
          orderId,
          isRead: false
        });
      }
    }
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };
const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    createdAt: new Date()
  }

  setNotifications(prev => [newNotification, ...prev])

  // ✅ Only send to server if current user is staff
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user.role

  if (['waiter', 'chef', 'admin'].includes(role)) {
    apiClient.createNotification(newNotification).catch(err => {
      console.error('Failed to create notification:', err)
    })
  }
}


  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    socketManager.onNewOrder((data) => {
      setOrders(prev => [...prev, data.order]);
      addNotification({
        type: 'order_placed',
        message: data.message,
        targetRole: ['waiter', 'chef'],
        tableId: data.tableId,
        orderId: data.order.id,
        isRead: false
      });
    });

    socketManager.onOrderStatusUpdate((data) => {
      updateOrderStatus(data.orderId, data.status, data.estimatedTime);
    });

    socketManager.onServiceRequest((data) => {
      addNotification({
        type: data.type,
        message: data.message || `${data.type.replace('_', ' ')} requested at ${data.tableId}`,
        targetRole: ['waiter'],
        tableId: data.tableId,
        isRead: false
      });
    });

    return () => {
      socketManager.removeAllListeners();
    };
  }, []);

  return (
    <OrderContext.Provider value={{
      orders,
      notifications,
      addToOrder,
      removeFromOrder,
      submitOrder,
      updateOrderStatus,
      currentOrder,
      clearOrder,
      addNotification,
      markNotificationAsRead
    }}>
      {children}
    </OrderContext.Provider>
  );
}