import express from 'express'
import Order from '../models/Order.js'
import MenuItem from '../models/MenuItem.js'
import Notification from '../models/Notification.js'
import { protect, authorize } from '../middleware/auth.js'
import { validateOrder } from '../middleware/validation.js'

const router = express.Router()

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, validateOrder, async (req, res) => {
  try {
    const { tableId, items, specialInstructions } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    console.log(tableId, items, specialInstructions);
    for (const item of items) {
      console.log(item);
      const menuItem = await MenuItem.findById(item.menuItem);
      console.log(menuItem);
      if (!menuItem) {
        return res.status(404).json({
          status: 'error',
          message: `Menu item not found: ${item.menuItem}`
        });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          status: 'error',
          message: `Menu item is not available: ${menuItem.name}`
        });
      }
      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        customizations: item.customizations || {},
        specialInstructions: item.specialInstructions,
        subtotal
      });
    }

    // Generate orderNumber
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = await Order.create({
      tableId,
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      specialInstructions,
      orderNumber // Add orderNumber
    });

    // Populate order details
    await order.populate('items.menuItem customer');

    // Create notification for waiters and chefs
    await Notification.create({
      type: 'order_placed',
      title: 'New Order Placed',
      message: `New order placed at ${tableId} (#${orderNumber})`,
      targetRole: ['waiter', 'chef'],
      tableId,
      orderId: order._id,
      priority: 'medium'
    });

    // Emit real-time notification
    req.io.emit('new_order', {
      order,
      tableId,
      message: `New order placed at ${tableId} (#${orderNumber})`
    });

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin, Waiter, Chef)
router.get('/', protect, authorize('admin', 'waiter', 'chef'), async (req, res) => {
  try {
    const { status, tableId, page = 1, limit = 20 } = req.query

    const filter = {}
    if (status) filter.status = status
    if (tableId) filter.tableId = tableId

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('items.menuItem')
      .populate('assignedWaiter', 'name')
      .populate('assignedChef', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments(filter)

    res.status(200).json({
      status: 'success',
      data: {
        orders,
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

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const orders = await Order.find({ customer: req.user._id })
      .populate('items.menuItem')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments({ customer: req.user._id })

    res.status(200).json({
      status: 'success',
      data: {
        orders,
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('items.menuItem')
      .populate('assignedWaiter', 'name')
      .populate('assignedChef', 'name')

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      })
    }

    // Check if user can access this order
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin, Waiter, Chef)
router.put('/:id/status', protect, authorize('admin', 'waiter', 'chef'), async (req, res) => {
  try {
    const { status, estimatedTime, assignedWaiter, assignedChef } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      })
    }

    // Update order
    order.status = status
    if (estimatedTime) {
      order.estimatedTime = estimatedTime
      order.remainingTime = estimatedTime * 60 // Convert to seconds
    }
    if (assignedWaiter) order.assignedWaiter = assignedWaiter
    if (assignedChef) order.assignedChef = assignedChef

    await order.save()
    await order.populate('customer items.menuItem')

    // Create notification based on status
    let notificationData = {
      tableId: order.tableId,
      orderId: order._id,
      priority: 'medium'
    }

    switch (status) {
      case 'confirmed':
        notificationData = {
          ...notificationData,
          type: 'order_confirmed',
          title: 'Order Confirmed',
          message: `Order confirmed for ${order.tableId}. Estimated time: ${estimatedTime} minutes`,
          targetRole: ['customer']
        }
        break
      case 'preparing':
        notificationData = {
          ...notificationData,
          type: 'order_preparing',
          title: 'Order Being Prepared',
          message: `Order for ${order.tableId} is being prepared`,
          targetRole: ['customer']
        }
        break
      case 'ready':
        notificationData = {
          ...notificationData,
          type: 'order_ready',
          title: 'Order Ready',
          message: `Order ready for ${order.tableId}`,
          targetRole: ['waiter']
        }
        break
      case 'served':
        notificationData = {
          ...notificationData,
          type: 'order_served',
          title: 'Order Served',
          message: `Order served to ${order.tableId}`,
          targetRole: ['admin']
        }
        break
    }

    if (notificationData.type) {
      await Notification.create(notificationData)
      
      // Emit real-time notification
      req.io.emit('order_status_update', {
        orderId: order._id,
        status,
        tableId: order.tableId,
        estimatedTime,
        message: notificationData.message
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: {
        order
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      })
    }

    // Check permissions
    if (req.user.role === 'customer' && order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      })
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel order in current status'
      })
    }

    order.status = 'cancelled'
    await order.save()

    // Create notification
    await Notification.create({
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: `Order cancelled for ${order.tableId}`,
      targetRole: ['waiter', 'chef'],
      tableId: order.tableId,
      orderId: order._id
    })

    // Emit real-time notification
    req.io.emit('order_cancelled', {
      orderId: order._id,
      tableId: order.tableId
    })

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

export default router