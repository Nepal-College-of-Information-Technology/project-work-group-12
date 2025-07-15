import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DollarSign, Users, Clock, TrendingUp, ShoppingBag, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../contexts/OrderContext'
import { formatCurrency } from '../lib/utils'

export function AdminPage() {
  const { user, logout } = useAuth()
  const { orders } = useOrder()

  // Mock analytics data
  const salesData = [
    { name: 'Mon', revenue: 2400, orders: 24 },
    { name: 'Tue', revenue: 1398, orders: 18 },
    { name: 'Wed', revenue: 9800, orders: 45 },
    { name: 'Thu', revenue: 3908, orders: 32 },
    { name: 'Fri', revenue: 4800, orders: 38 },
    { name: 'Sat', revenue: 8200, orders: 52 },
    { name: 'Sun', revenue: 7300, orders: 48 }
  ]

  const categoryData = [
    { name: 'Main Course', value: 45, color: '#f59e0b' },
    { name: 'Appetizer', value: 25, color: '#3b82f6' },
    { name: 'Dessert', value: 20, color: '#10b981' },
    { name: 'Beverages', value: 10, color: '#f43f5e' }
  ]

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

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
                <h1 className="text-xl font-bold text-slate-800">TableTap Admin</h1>
                <p className="text-sm text-slate-600">Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="luxury">Admin</Badge>
              <Button variant="ghost" size="sm" onClick={logout}>
                {user?.name}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 mb-1">Total Orders</p>
                        <p className="text-2xl font-bold text-green-900">{totalOrders}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 mb-1">Avg Order Value</p>
                        <p className="text-2xl font-bold text-purple-900">{formatCurrency(avgOrderValue)}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 mb-1">Active Tables</p>
                        <p className="text-2xl font-bold text-orange-900">12</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Weekly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Order Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#f59e0b" />
                      <Bar dataKey="orders" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders?.slice(0, 10).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold">Order #{order?.id?.slice(-4)}</p>
                            <p className="text-sm text-slate-600">{order?.tableId}</p>
                          </div>
                          <Badge variant={
                            order?.status === 'completed' ? 'success' :
                            order?.status === 'preparing' ? 'warning' :
                            'secondary'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Peak Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>12:00 PM - 1:00 PM</span>
                        <Badge variant="success">Peak</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>7:00 PM - 8:00 PM</span>
                        <Badge variant="warning">Busy</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>6:00 PM - 7:00 PM</span>
                        <Badge variant="secondary">Normal</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Customer Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-amber-600">4.8</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Based on 247 reviews</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}