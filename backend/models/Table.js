import mongoose from 'mongoose'

const tableSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Table number is required'],
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Table capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [20, 'Capacity cannot exceed 20']
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  qrCodeImage: {
    type: String, // Base64 or URL to QR code image
    default: null
  },
  wifiCredentials: {
    ssid: {
      type: String,
      default: process.env.RESTAURANT_WIFI_SSID || 'TableTap_Premium'
    },
    password: {
      type: String,
      default: process.env.RESTAURANT_WIFI_PASSWORD || 'Welcome2024'
    }
  },
  location: {
    section: {
      type: String,
      enum: ['indoor', 'outdoor', 'private', 'bar', 'vip'],
      default: 'indoor'
    },
    floor: {
      type: Number,
      default: 1
    },
    coordinates: {
      x: Number,
      y: Number
    }
  },
  amenities: [{
    type: String,
    enum: ['window_view', 'power_outlet', 'wheelchair_accessible', 'high_chair_available', 'quiet_zone']
  }],
  reservations: [{
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startTime: Date,
    endTime: Date,
    partySize: Number,
    specialRequests: String,
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed'
    }
  }],
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Generate QR code before saving
tableSchema.pre('save', async function(next) {
  if (this.isNew && !this.qrCode) {
    this.qrCode = `table_${this.number}_${Date.now()}`
  }
  next()
})

export default mongoose.model('Table', tableSchema)