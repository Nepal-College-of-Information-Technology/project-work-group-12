import express from 'express'
import QRCode from 'qrcode'
import Table from '../models/Table.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Generate QR code for table
// @route   POST /api/qr/generate/:tableId
// @access  Private (Admin)
router.post('/generate/:tableId', protect, authorize('admin'), async (req, res) => {
  try {
    const table = await Table.findById(req.params.tableId)

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    const qrCodeUrl = `${process.env.FRONTEND_URL}/table/${table.qrCode}`
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })

    // Update table with new QR code image
    table.qrCodeImage = qrCodeDataURL
    await table.save()

    res.status(200).json({
      status: 'success',
      message: 'QR code generated successfully',
      data: {
        qrCode: table.qrCode,
        qrCodeImage: qrCodeDataURL,
        qrCodeUrl,
        tableNumber: table.number
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Get QR code for table
// @route   GET /api/qr/:tableId
// @access  Private (Admin, Waiter)
router.get('/:tableId', protect, authorize('admin', 'waiter'), async (req, res) => {
  try {
    const table = await Table.findById(req.params.tableId)

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      })
    }

    const qrCodeUrl = `${process.env.FRONTEND_URL}/table/${table.qrCode}`

    res.status(200).json({
      status: 'success',
      data: {
        qrCode: table.qrCode,
        qrCodeImage: table.qrCodeImage,
        qrCodeUrl,
        tableNumber: table.number,
        wifiCredentials: table.wifiCredentials
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Validate QR code
// @route   GET /api/qr/validate/:qrCode
// @access  Public
router.get('/validate/:qrCode', async (req, res) => {
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
      message: 'QR code is valid',
      data: {
        tableId: table._id,
        tableNumber: table.number,
        capacity: table.capacity,
        wifiCredentials: table.wifiCredentials,
        location: table.location,
        amenities: table.amenities
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Generate bulk QR codes for all tables
// @route   POST /api/qr/generate-bulk
// @access  Private (Admin)
router.post('/generate-bulk', protect, authorize('admin'), async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true })

    const qrCodes = []

    for (const table of tables) {
      const qrCodeUrl = `${process.env.FRONTEND_URL}/table/${table.qrCode}`
      
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      })

      table.qrCodeImage = qrCodeDataURL
      await table.save()

      qrCodes.push({
        tableId: table._id,
        tableNumber: table.number,
        qrCode: table.qrCode,
        qrCodeImage: qrCodeDataURL,
        qrCodeUrl
      })
    }

    res.status(200).json({
      status: 'success',
      message: `Generated QR codes for ${qrCodes.length} tables`,
      data: {
        qrCodes
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