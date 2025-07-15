import express from 'express'
import MenuItem from '../models/MenuItem.js'
import { protect, authorize, optionalAuth } from '../middleware/auth.js'
import { validateMenuItem } from '../middleware/validation.js'

const router = express.Router()

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      search, 
      dietary, 
      available = 'true',
      page = 1, 
      limit = 50,
      sort = '-popularity'
    } = req.query

    // Build filter
    const filter = {}
    if (category) filter.category = category
    if (available === 'true') filter.isAvailable = true
    if (dietary) filter.dietaryTags = { $in: dietary.split(',') }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const menuItems = await MenuItem.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await MenuItem.countDocuments(filter)

    // Get categories for filtering
    const categories = await MenuItem.distinct('category')
    const dietaryTags = await MenuItem.distinct('dietaryTags')

    res.status(200).json({
      status: 'success',
      data: {
        menuItems,
        categories,
        dietaryTags,
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

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)

    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        menuItem
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), validateMenuItem, async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body)

    res.status(201).json({
      status: 'success',
      message: 'Menu item created successfully',
      data: {
        menuItem
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Menu item updated successfully',
      data: {
        menuItem
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id)

    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Menu item deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/availability
// @access  Private (Admin, Chef)
router.patch('/:id/availability', protect, authorize('admin', 'chef'), async (req, res) => {
  try {
    const { isAvailable } = req.body

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    )

    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      })
    }

    // Emit real-time update
    req.io.emit('menu_item_availability', {
      menuItemId: menuItem._id,
      isAvailable,
      name: menuItem.name
    })

    res.status(200).json({
      status: 'success',
      message: `Menu item ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: {
        menuItem
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Get popular menu items
// @route   GET /api/menu/popular/items
// @access  Public
router.get('/popular/items', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const popularItems = await MenuItem.find({ isAvailable: true })
      .sort({ popularity: -1, rating: -1 })
      .limit(parseInt(limit))

    res.status(200).json({
      status: 'success',
      data: {
        popularItems
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