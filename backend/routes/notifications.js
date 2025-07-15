import express from 'express'
import Notification from '../models/Notification.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread = false } = req.query

    const filter = {
      $or: [
        { targetRole: req.user.role },
        { targetUsers: req.user._id }
      ]
    }

    if (unread === 'true') {
      filter.isRead = false
    }

    const notifications = await Notification.find(filter)
      .populate('orderId', 'orderNumber status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false
    })

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private (Admin, Waiter, Chef)
router.post('/', protect, authorize('admin', 'waiter', 'chef'), async (req, res) => {
  try {
    const { type, title, message, targetRole, targetUsers, tableId, orderId, priority, data } = req.body

    const notification = await Notification.create({
      type,
      title,
      message,
      targetRole,
      targetUsers,
      tableId,
      orderId,
      priority,
      data
    })

    // Emit real-time notification
    req.io.emit('new_notification', {
      notification,
      targetRole,
      targetUsers
    })

    res.status(201).json({
      status: 'success',
      message: 'Notification created successfully',
      data: {
        notification
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      })
    }

    // Check if user can mark this notification as read
    const canRead = notification.targetRole.includes(req.user.role) || 
                   notification.targetUsers.includes(req.user._id)

    if (!canRead) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      })
    }

    // Add user to readBy array if not already there
    const alreadyRead = notification.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    )

    if (!alreadyRead) {
      notification.readBy.push({
        user: req.user._id,
        readAt: new Date()
      })
    }

    // Mark as read if all target users have read it
    if (notification.targetUsers.length > 0) {
      const allRead = notification.targetUsers.every(userId =>
        notification.readBy.some(read => read.user.toString() === userId.toString())
      )
      if (allRead) {
        notification.isRead = true
      }
    } else {
      notification.isRead = true
    }

    await notification.save()

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { targetRole: req.user.role },
          { targetUsers: req.user._id }
        ],
        isRead: false
      },
      {
        isRead: true,
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    )

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id)

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Send custom notification
// @route   POST /api/notifications/custom
// @access  Private (Admin, Waiter)
router.post('/custom', protect, authorize('admin', 'waiter'), async (req, res) => {
  try {
    const { tableId, type, message } = req.body

    let notificationData = {
      tableId,
      priority: 'medium'
    }

    switch (type) {
      case 'water_request':
        notificationData = {
          ...notificationData,
          type: 'water_request',
          title: 'Water Request',
          message: `Water requested at ${tableId}`,
          targetRole: ['waiter']
        }
        break
      case 'assistance_request':
        notificationData = {
          ...notificationData,
          type: 'assistance_request',
          title: 'Assistance Request',
          message: message || `Assistance requested at ${tableId}`,
          targetRole: ['waiter']
        }
        break
      case 'payment_request':
        notificationData = {
          ...notificationData,
          type: 'payment_request',
          title: 'Payment Request',
          message: `Payment requested at ${tableId}`,
          targetRole: ['waiter']
        }
        break
      case 'table_cleanup':
        notificationData = {
          ...notificationData,
          type: 'table_cleanup',
          title: 'Table Cleanup',
          message: `Table ${tableId} needs cleanup`,
          targetRole: ['waiter']
        }
        break
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid notification type'
        })
    }

    const notification = await Notification.create(notificationData)

    // Emit real-time notification
    req.io.emit('custom_notification', {
      notification,
      tableId,
      type
    })

    res.status(201).json({
      status: 'success',
      message: 'Notification sent successfully',
      data: {
        notification
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

export default router