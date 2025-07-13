import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, AlertCircle, Clock, ChefHat, X } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../contexts/OrderContext'
import { Notification } from '../types'

export function NotificationSystem() {
  const { user } = useAuth()
  const { notifications, markNotificationAsRead } = useOrder()
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (user && notifications.length > 0) {
      const relevantNotifications = notifications.filter(
        notif => notif.targetRole.includes(user.role) && !notif.isRead
      )
      setVisibleNotifications(relevantNotifications.slice(0, 3))
    }
  }, [notifications, user])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed': return <Bell className="w-5 h-5 text-blue-600" />
      case 'order_confirmed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'order_ready': return <ChefHat className="w-5 h-5 text-orange-600" />
      case 'customer_seated': return <AlertCircle className="w-5 h-5 text-purple-600" />
      case 'water_request': return <Clock className="w-5 h-5 text-cyan-600" />
      default: return <Bell className="w-5 h-5 text-slate-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_placed': return 'border-blue-200 bg-blue-50'
      case 'order_confirmed': return 'border-green-200 bg-green-50'
      case 'order_ready': return 'border-orange-200 bg-orange-50'
      case 'customer_seated': return 'border-purple-200 bg-purple-50'
      case 'water_request': return 'border-cyan-200 bg-cyan-50'
      default: return 'border-slate-200 bg-slate-50'
    }
  }

  const handleDismiss = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    setVisibleNotifications(prev => prev.filter(notif => notif.id !== notificationId))
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${getNotificationColor(notification.type)} border-l-4 shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {notification.tableId}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDismiss(notification.id)}
                    className="h-6 w-6 text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}