import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, ChefHat, Bell } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { formatTime } from '../lib/utils'

interface OrderTimerProps {
  estimatedTime: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served'
  orderId: string
}

export function OrderTimer({ estimatedTime, status, orderId }: OrderTimerProps) {
  const [remainingTime, setRemainingTime] = useState(estimatedTime * 60)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (status === 'confirmed' || status === 'preparing') {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 0) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [status])

  useEffect(() => {
    const totalTime = estimatedTime * 60
    const elapsed = totalTime - remainingTime
    setProgress((elapsed / totalTime) * 100)
  }, [remainingTime, estimatedTime])

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-green-500'
      case 'served': return 'bg-slate-500'
      default: return 'bg-slate-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending': return 'Order Placed'
      case 'confirmed': return 'Order Confirmed'
      case 'preparing': return 'Preparing...'
      case 'ready': return 'Ready for Pickup'
      case 'served': return 'Served'
      default: return 'Unknown'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-4 top-20 z-50"
    >
      <Card className="w-64 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="font-semibold text-slate-800">Order #{orderId?.slice(-4)}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status</span>
              <Badge variant={status === 'ready' ? 'success' : 'secondary'}>
                {getStatusText()}
              </Badge>
            </div>

            {(status === 'confirmed' || status === 'preparing') && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Time Left</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="font-mono font-medium">
                      {formatTime(remainingTime)}
                    </span>
                  </div>
                </div>

                <Progress value={progress} className="h-2" />
              </>
            )}

            {status === 'preparing' && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 text-sm text-orange-600"
              >
                <ChefHat className="w-4 h-4" />
                <span>Chef is preparing your order</span>
              </motion.div>
            )}

            {status === 'ready' && (
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-2 text-sm text-green-600"
              >
                <Bell className="w-4 h-4" />
                <span>Your order is ready!</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}