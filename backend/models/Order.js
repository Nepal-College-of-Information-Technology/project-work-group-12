import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  customizations: {
    type: Map,
    of: String,
    default: new Map()
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  }
})

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  tableId: {
    type: String,
    required: [true, 'Table ID is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  estimatedTime: {
    type: Number, // in minutes
    default: null
  },
  remainingTime: {
    type: Number, // in seconds
    default: null
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital_wallet', 'online'],
    default: 'cash'
  },
  assignedWaiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedChef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    submittedAt: Date
  }
}, {
  timestamps: true
})

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `ORD${(count + 1).toString().padStart(6, '0')}`
  }
  next()
})

// Index for efficient queries
orderSchema.index({ tableId: 1, status: 1 })
orderSchema.index({ customer: 1, createdAt: -1 })
orderSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Order', orderSchema)