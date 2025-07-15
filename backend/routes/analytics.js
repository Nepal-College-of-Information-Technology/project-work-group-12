import express from 'express'
import Order from '../models/Order.js'
import MenuItem from '../models/MenuItem.js'
import User from '../models/User.js'
import Table from '../models/Table.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '7d' } = req.query

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '1d':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Basic metrics
    const [
      totalOrders,
      totalRevenue,
      completedOrders,
      activeOrders,
      totalCustomers,
      activeTables
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $in: ['completed', 'served'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ 
        createdAt: { $gte: startDate }, 
        status: { $in: ['completed', 'served'] } 
      }),
      Order.countDocuments({ 
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } 
      }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startDate } }),
      Table.countDocuments({ status: 'occupied' })
    ])

    const revenue = totalRevenue[0]?.total || 0
    const averageOrderValue = completedOrders > 0 ? revenue / completedOrders : 0

    // Sales by day
    const salesByDay = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'served'] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Popular menu items
    const popularItems = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' }
    ])

    // Orders by category
    const ordersByCategory = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $group: {
          _id: '$menuItem.category',
          count: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Peak hours
    const peakHours = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Average preparation time
    const avgPreparationTime = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'served'] },
          estimatedTime: { $exists: true }
        } 
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$estimatedTime' }
        }
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalOrders,
          totalRevenue: revenue,
          averageOrderValue,
          completedOrders,
          activeOrders,
          totalCustomers,
          activeTables
        },
        salesByDay,
        popularItems,
        ordersByCategory,
        peakHours,
        orderStatusDistribution,
        averagePreparationTime: avgPreparationTime[0]?.avgTime || 0
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private (Admin)
router.get('/sales', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    let groupFormat
    switch (groupBy) {
      case 'hour':
        groupFormat = '%Y-%m-%d %H:00'
        break
      case 'day':
        groupFormat = '%Y-%m-%d'
        break
      case 'week':
        groupFormat = '%Y-W%U'
        break
      case 'month':
        groupFormat = '%Y-%m'
        break
      default:
        groupFormat = '%Y-%m-%d'
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        salesData
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Get menu performance
// @route   GET /api/analytics/menu-performance
// @access  Private (Admin)
router.get('/menu-performance', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query

    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    const menuPerformance = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          name: '$menuItem.name',
          category: '$menuItem.category',
          price: '$menuItem.price',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          avgQuantityPerOrder: { $divide: ['$totalQuantity', '$orderCount'] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        menuPerformance
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private (Admin)
router.get('/customers', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query

    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Customer acquisition
    const newCustomers = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Customer spending patterns
    const customerSpending = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'served'] }
        }
      },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      { $sort: { totalSpent: -1 } },
      { $limit: 50 }
    ])

    // Repeat customers
    const repeatCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$customer',
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$orderCount',
          customerCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        newCustomers,
        customerSpending,
        repeatCustomers
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