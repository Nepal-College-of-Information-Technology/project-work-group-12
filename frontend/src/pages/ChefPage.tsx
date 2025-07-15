import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, Clock, CheckCircle, AlertCircle, Flame, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../contexts/OrderContext'
import { formatCurrency } from '../lib/utils'

export function ChefPage() {
  const { user, logout } = useAuth()
  const { orders, updateOrderStatus } = useOrder()
  const [estimatedTimes, setEstimatedTimes] = useState<Record<string, number>>({})

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const preparingOrders = orders.filter(order => order.status === 'preparing')
  const readyOrders = orders.filter(order => order.status === 'ready')

  const handleConfirmOrder = (orderId: string) => {
    const estimatedTime = estimatedTimes[orderId] || 20
    updateOrderStatus(orderId, 'confirmed', estimatedTime)
    setTimeout(() => {
      updateOrderStatus(orderId, 'preparing')
    }, 1000)
  }

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready')
  }

  const handleSetEstimatedTime = (orderId: string, time: number) => {
    setEstimatedTimes(prev => ({
      ...prev,
      [orderId]: time
    }))
  }

  const getOrderPriority = (order: any) => {
    const timeElapsed = Date.now() - new Date(order.createdAt).getTime()
    const minutes = Math.floor(timeElapsed / 60000)
    
    if (minutes > 30) return 'high'
    if (minutes > 20) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">TableTap Kitchen</h1>
                <p className="text-sm text-slate-600">Chef Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-50">
                  <Flame className="w-3 h-3 mr-1" />
                  {preparingOrders.length} Preparing
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {readyOrders.length} Ready
                </Badge>
              </div>
              <Badge variant="outline">Chef</Badge>
              <Button variant="ghost" size="sm" onClick={logout}>
                {user?.name}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="pending" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              New Orders {pendingOrders.length > 0 && `(${pendingOrders.length})`}
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparing {preparingOrders.length > 0 && `(${preparingOrders.length})`}
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready {readyOrders.length > 0 && `(${readyOrders.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingOrders.map((order) => {
                  const priority = getOrderPriority(order)
                  return (
                    <Card key={order.id} className={`border-0 shadow-lg ${getPriorityColor(priority)}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Order #{order?.id?.slice(-4)}</CardTitle>
                          <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'warning' : 'secondary'}>
                            {priority} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>{order.tableId}</span>
                          <span>•</span>
                          <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          {order.items.map((item) => (
                            <div key={item?.id?.slice(-4)} className="bg-white/80 p-3 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium">{item.menuItem.name}</span>
                                <span className="text-sm text-slate-600">x{item.quantity}</span>
                              </div>
                              {Object.entries(item.customizations).map(([key, value]) => (
                                <div key={key} className="text-xs text-slate-600">
                                  {key}: {value}
                                </div>
                              ))}
                              {item.specialInstructions && (
                                <div className="text-xs text-orange-600 mt-1">
                                  Note: {item.specialInstructions}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-600">Estimated time (minutes):</span>
                          </div>
                          <Input
                            type="number"
                            placeholder="20"
                            value={estimatedTimes[order.id] || ''}
                            onChange={(e) => handleSetEstimatedTime(order.id, parseInt(e.target.value))}
                            className="w-full"
                          />
                          <Button
                            onClick={() => handleConfirmOrder(order.id)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm & Start Cooking
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="preparing" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {preparingOrders.map((order) => (
                  <Card key={order?.id} className="border-0 shadow-lg bg-orange-50 border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Order #{order?.id?.slice(-4)}</CardTitle>
                        <Badge className="bg-orange-100 text-orange-800">
                          <Flame className="w-3 h-3 mr-1" />
                          Cooking
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{order?.tableId}</span>
                        <span>•</span>
                        <span>{order?.estimatedTime} min</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        {order.items.map((item) => (
                          <div key={item?.id} className="bg-white/80 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{item.menuItem.name}</span>
                              <span className="text-sm text-slate-600">x{item.quantity}</span>
                            </div>
                            {Object.entries(item?.customizations).map(([key, value]) => (
                              <div key={key} className="text-xs text-slate-600">
                                {key}: {value}
                              </div>
                            ))}
                            {item.specialInstructions && (
                              <div className="text-xs text-orange-600 mt-1">
                                Note: {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={() => handleMarkReady(order.id)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Ready
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="ready" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readyOrders.map((order,index) => (
                  <Card key={index} className="border-0 shadow-lg bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Order #{order?.id?.slice(-4)}</CardTitle>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{order.tableId}</span>
                        <span>•</span>
                        <span>Ready for pickup</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.items.map((item,index) => (
                          <div key={index} className="bg-white/80 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{item.menuItem.name}</span>
                              <span className="text-sm text-slate-600">x{item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          Waiting for waiter to collect
                        </p>
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