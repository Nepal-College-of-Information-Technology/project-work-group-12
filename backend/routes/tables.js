import express from 'express'
import QRCode from 'qrcode'
import Table from '../models/Table.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private (Admin, Waiter)
router.get('/', protect, authorize('admin', 'waiter'), async (req, res) => {
  try {
    const { status, section, floor } = req.query

    const filter = { isActive: true }
    if (status) filter.status = status
    if (section) filter['location.section'] = section
    if (floor) filter['location.floor'] = parseInt(floor)

    const tables = await Table.find(filter)
      .populate('currentOrder')
      .sort({ number: 1 })

    res.status(200).json({
      status: 'success',
      data: {
        tables
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate('currentOrder')

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        table
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Get table by QR code
// @route   GET /api/tables/qr/:qrCode
// @access  Public
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const table = await Table.findOne({ qrCode: req.params.qrCode })

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid QR code'
      })
    }

    if (!table.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Table is not active'
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        table: {
          id: table._id,
          number: table.number,
          capacity: table.capacity,
          wifiCredentials: table.wifiCredentials,
          location: table.location,
          amenities: table.amenities
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

// @desc    Create table
// @route   POST /api/tables
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { number, capacity, location, amenities } = req.body

    // Check if table number already exists
    const existingTable = await Table.findOne({ number })
    if (existingTable) {
      return res.status(400).json({
        status: 'error',
        message: 'Table number already exists'
      })
    }

    // Generate QR code
    const qrCode = `table_${number}_${Date.now()}`
    const qrCodeUrl = `${process.env.FRONTEND_URL}/table/${qrCode}`
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl)

    const table = await Table.create({
      number,
      capacity,
      qrCode,
      qrCodeImage,
      location,
      amenities
    })

    res.status(201).json({
      status: 'success',
      message: 'Table created successfully',
      data: {
        table
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Table updated successfully',
      data: {
        table
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Update table status
// @route   PATCH /api/tables/:id/status
// @access  Private (Admin, Waiter)
router.patch('/:id/status', protect, authorize('admin', 'waiter'), async (req, res) => {
  try {
    const { status } = req.body

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    // Emit real-time update
    req.io.emit('table_status_update', {
      tableId: table._id,
      tableNumber: table.number,
      status
    })

    res.status(200).json({
      status: 'success',
      message: 'Table status updated successfully',
      data: {
        table
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Generate new QR code for table
// @route   POST /api/tables/:id/qr-code
// @access  Private (Admin)
router.post('/:id/qr-code', protect, authorize('admin'), async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    // Generate new QR code
    const qrCode = `table_${table.number}_${Date.now()}`
    const qrCodeUrl = `${process.env.FRONTEND_URL}/table/${qrCode}`
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl)

    table.qrCode = qrCode
    table.qrCodeImage = qrCodeImage
    await table.save()

    res.status(200).json({
      status: 'success',
      message: 'QR code regenerated successfully',
      data: {
        qrCode,
        qrCodeImage
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Table deactivated successfully'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

export default router