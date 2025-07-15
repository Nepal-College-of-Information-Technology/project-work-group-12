import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('-password')

      if (!user || !user.isActive) {
        return next(new Error('Authentication error'))
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.user.role})`)

    // Join role-based rooms
    socket.join(socket.user.role)
    
    // Join table-specific room if customer
    if (socket.user.role === 'customer' && socket.user.tableId) {
      socket.join(`table_${socket.user.tableId}`)
    }

    // Handle table join for customers
    socket.on('join_table', (tableId) => {
      if (socket.user.role === 'customer') {
        socket.join(`table_${tableId}`)
        socket.user.tableId = tableId
        console.log(`👤 Customer ${socket.user.name} joined table ${tableId}`)
        
        // Notify waiters about new customer
        socket.to('waiter').emit('customer_seated', {
          tableId,
          customer: {
            id: socket.user._id,
            name: socket.user.name
          },
          timestamp: new Date()
        })
      }
    })

    // Handle order updates
    socket.on('order_update', (data) => {
      const { orderId, status, tableId, estimatedTime } = data
      
      // Broadcast to relevant roles
      if (status === 'confirmed') {
        socket.to(`table_${tableId}`).emit('order_confirmed', {
          orderId,
          estimatedTime,
          timestamp: new Date()
        })
      } else if (status === 'ready') {
        socket.to('waiter').emit('order_ready', {
          orderId,
          tableId,
          timestamp: new Date()
        })
        socket.to(`table_${tableId}`).emit('order_ready', {
          orderId,
          timestamp: new Date()
        })
      }
    })

    // Handle service requests
    socket.on('service_request', (data) => {
      const { type, tableId, message } = data
      
      if (socket.user.role === 'customer') {
        socket.to('waiter').emit('service_request', {
          type,
          tableId,
          message,
          customer: {
            id: socket.user._id,
            name: socket.user.name
          },
          timestamp: new Date()
        })
      }
    })

    // Handle chef notifications
    socket.on('chef_update', (data) => {
      const { orderId, status, estimatedTime } = data
      
      if (socket.user.role === 'chef') {
        // Notify waiters and customers
        socket.to('waiter').emit('chef_update', {
          orderId,
          status,
          estimatedTime,
          timestamp: new Date()
        })
        
        if (data.tableId) {
          socket.to(`table_${data.tableId}`).emit('order_status_update', {
            orderId,
            status,
            estimatedTime,
            timestamp: new Date()
          })
        }
      }
    })

    // Handle waiter notifications
    socket.on('waiter_update', (data) => {
      const { tableId, status, message } = data
      
      if (socket.user.role === 'waiter') {
        // Notify admin and other waiters
        socket.to('admin').emit('waiter_update', {
          tableId,
          status,
          message,
          waiter: {
            id: socket.user._id,
            name: socket.user.name
          },
          timestamp: new Date()
        })
      }
    })

    // Handle admin broadcasts
    socket.on('admin_broadcast', (data) => {
      if (socket.user.role === 'admin') {
        const { targetRole, message, priority } = data
        
        socket.to(targetRole).emit('admin_message', {
          message,
          priority,
          from: socket.user.name,
          timestamp: new Date()
        })
      }
    })

    // Handle menu item availability updates
    socket.on('menu_availability_update', (data) => {
      if (['admin', 'chef'].includes(socket.user.role)) {
        const { menuItemId, isAvailable, name } = data
        
        // Broadcast to all connected clients
        io.emit('menu_item_availability', {
          menuItemId,
          isAvailable,
          name,
          updatedBy: socket.user.name,
          timestamp: new Date()
        })
      }
    })

    // Handle table status updates
    socket.on('table_status_update', (data) => {
      if (['admin', 'waiter'].includes(socket.user.role)) {
        const { tableId, status } = data
        
        // Broadcast to admin and waiters
        socket.to('admin').to('waiter').emit('table_status_update', {
          tableId,
          status,
          updatedBy: socket.user.name,
          timestamp: new Date()
        })
      }
    })

    // Handle real-time order tracking
    socket.on('start_order_tracking', (orderId) => {
      socket.join(`order_${orderId}`)
      console.log(`📱 Started tracking order ${orderId} for ${socket.user.name}`)
    })

    socket.on('stop_order_tracking', (orderId) => {
      socket.leave(`order_${orderId}`)
      console.log(`📱 Stopped tracking order ${orderId} for ${socket.user.name}`)
    })

    // Handle typing indicators for special instructions
    socket.on('typing_start', (data) => {
      const { tableId } = data
      socket.to('waiter').to('chef').emit('customer_typing', {
        tableId,
        customer: socket.user.name
      })
    })

    socket.on('typing_stop', (data) => {
      const { tableId } = data
      socket.to('waiter').to('chef').emit('customer_stopped_typing', {
        tableId,
        customer: socket.user.name
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name} (${socket.user.role})`)
      
      // Notify relevant parties about disconnection
      if (socket.user.role === 'customer' && socket.user.tableId) {
        socket.to('waiter').emit('customer_disconnected', {
          tableId: socket.user.tableId,
          customer: {
            id: socket.user._id,
            name: socket.user.name
          },
          timestamp: new Date()
        })
      }
    })

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong')
    })
  })

  // Periodic cleanup of inactive connections
  setInterval(() => {
    io.emit('ping')
  }, 30000) // Ping every 30 seconds
}

export default socketHandler