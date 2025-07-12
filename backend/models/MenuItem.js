import mongoose from 'mongoose'

const customizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  isRequired: {
    type: Boolean,
    default: false
  },
  additionalCost: {
    type: Number,
    default: 0
  }
})

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverages', 'Specials']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  allergens: [{
    type: String,
    enum: ['dairy', 'gluten', 'nuts', 'shellfish', 'eggs', 'soy', 'fish', 'none','alcohol','coconut']
  }],
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'spicy', 'organic', 'low-calorie']
  }],
  preparationTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute']
  },
  customizations: [customizationSchema],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  popularity: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index for search functionality
menuItemSchema.index({ name: 'text', description: 'text' })

export default mongoose.model('MenuItem', menuItemSchema)