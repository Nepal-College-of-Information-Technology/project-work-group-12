import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, User, Utensils, CreditCard, Clock, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { MenuGrid } from '../components/MenuGrid'
import { OrderTimer } from '../components/OrderTimer'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../contexts/OrderContext'
import { formatCurrency } from '../lib/utils'
import apiClient from '../lib/api';

export function CustomerPage() {
  const { user, logout } = useAuth()
  const { currentOrder, orders, submitOrder, addToOrder, removeFromOrder, addNotification } = useOrder()
  const [tableId] = useState('T' + Math.random().toString(36).substr(2, 6).toUpperCase())
  const [activeTab, setActiveTab] = useState('menu')
  const [menuItems, setMenuItems] = useState([])

  useEffect(() => {
  const fetchMenuItems = async () => {
    const response = await apiClient.getMenuItems()
    console.log(response)
    setMenuItems(response.data.menuItems || [])
  }

  fetchMenuItems()
}, [])
  const userId = user?.id || ''
  const userOrders = orders.filter(order => order.tableId === tableId)
  const activeOrder = userOrders.find(order => ['pending', 'confirmed', 'preparing'].includes(order.status))

  const handleSubmitOrder = async () => {
    if (currentOrder.length === 0) return
    
    await submitOrder(tableId, user?.id || '')
    
    // Notify waiter about new customer
    addNotification({
      type: 'customer_seated',
      message: `Customer seated at ${tableId}`,
      targetRole: ['waiter'],
      tableId,
      isRead: false
    })
    
    setActiveTab('orders')
  }

  const handleWaterRequest = () => {
    addNotification({
      type: 'water_request',
      message: `Water requested at ${tableId}`,
      targetRole: ['waiter'],
      tableId,
      isRead: false
    })
  }

  const cartTotal = currentOrder.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">TT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">TableTap</h1>
                <p className="text-sm text-slate-600">Table {tableId}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWaterRequest}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Request Water
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                {user?.name}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Timer */}
      {activeOrder && (
        <OrderTimer
          estimatedTime={activeOrder.estimatedTime || 0}
          status={activeOrder.status}
          orderId={activeOrder.id}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart ({currentOrder.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Menu</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Discover our carefully curated selection of premium dishes, crafted with the finest ingredients and attention to detail.
                </p>
              </div>

              <MenuGrid items={menuItems} onAddToOrder={addToOrder} />
            </motion.div>
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentOrder.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 mb-4">Your cart is empty</p>
                      <Button onClick={() => setActiveTab('menu')} variant="outline">
                        Browse Menu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentOrder.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{item.menuItem.name}</h4>
                            <p className="text-sm text-slate-600">{item.menuItem.description}</p>
                            {item.specialInstructions && (
                              <p className="text-xs text-slate-500 mt-1">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromOrder(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-2xl font-bold text-amber-600">
                            {formatCurrency(cartTotal)}
                          </span>
                        </div>
                        <Button
                          onClick={handleSubmitOrder}
                          className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium"
                        >
                          <CreditCard className="w-5 h-5 mr-2" />
                          Place Order
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 mb-4">No orders yet</p>
                      <Button onClick={() => setActiveTab('menu')} variant="outline">
                        Start Ordering
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => (
                        <div key={order?.id?.slice(-4)} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">Order #{order?.id?.slice(-4)}</span>
                              <Badge variant={
                                order.status === 'ready' ? 'success' :
                                order.status === 'preparing' ? 'warning' :
                                'secondary'
                              }>
                                {order.status}
                              </Badge>
                            </div>
                            <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.menuItem.name} x{item.quantity}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-sm text-slate-500">
                            Ordered: {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}