import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle, Users, Bell, Coffee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../contexts/OrderContext'
import { formatCurrency } from '../lib/utils'

export function WaiterPage() {
  const { user, logout } = useAuth()
  const { orders, notifications, markNotificationAsRead } = useOrder()

  const unreadNotifications = notifications.filter(n => !n.isRead && n.targetRole.includes('waiter'))
  
  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'served': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">TT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">TableTap Waiter</h1>
                <p className="text-sm text-slate-600">Service Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </div>
              <Badge variant="outline">Waiter</Badge>
              <Button variant="ghost" size="sm" onClick={logout}>
                {user?.name}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Active Orders</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
            </TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.filter(order => order.status !== 'completed').map((order) => (
                  <Card key={order.id} className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Order #{order?.id?.slice(-4)}</CardTitle>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>{order.tableId}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.menuItem.name} x{item.quantity}</span>
                            <span>{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                      {order.status === 'ready' && (
                        <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Served
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Service Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.filter(n => n.targetRole.includes('waiter')).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          notification.isRead 
                            ? 'bg-slate-50 border-slate-300' 
                            : 'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {notification.type === 'customer_seated' && <Users className="w-4 h-4 text-blue-600" />}
                              {notification.type === 'water_request' && <Coffee className="w-4 h-4 text-cyan-600" />}
                              {notification.type === 'order_ready' && <CheckCircle className="w-4 h-4 text-green-600" />}
                              <Badge variant="outline" className="text-xs">
                                {notification.tableId}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800">{notification.message}</p>
                          </div>
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }, (_, i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Table {i + 1}</h3>
                        <Badge variant={i % 3 === 0 ? 'success' : i % 3 === 1 ? 'warning' : 'secondary'}>
                          {i % 3 === 0 ? 'Available' : i % 3 === 1 ? 'Occupied' : 'Reserved'}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>Capacity: 4 people</p>
                        {i % 3 === 1 && (
                          <p className="text-orange-600">Order in progress</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}