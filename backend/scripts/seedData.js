import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import MenuItem from '../models/MenuItem.js'
import Table from '../models/Table.js'
import QRCode from 'qrcode'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🍃 MongoDB Connected for seeding')
  } catch (error) {
    console.error('❌ Database connection error:', error.message)
    process.exit(1)
  }
}

const seedUsers = async () => {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@tabletap.com',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      name: 'John Waiter',
      email: 'waiter@tabletap.com',
      password: 'password123',
      role: 'waiter',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      name: 'Chef Maria',
      email: 'chef@tabletap.com',
      password: 'password123',
      role: 'chef',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      name: 'Customer Demo',
      email: 'customer@tabletap.com',
      password: 'password123',
      role: 'customer',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    }
  ]

  await User.deleteMany({})
  await User.insertMany(users)
  console.log('✅ Users seeded successfully')
}

const seedMenuItems = async () => {
  const menuItems = [
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      name: 'Truffle Risotto',
      description: 'Creamy Arborio rice with black truffle, parmesan, and wild mushrooms',
      price: 32.00,
      category: 'Main Course',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      allergens: ['dairy', 'gluten'],
      dietaryTags: ['vegetarian'],
      preparationTime: 25,
      customizations: [
        {
          id: 'cheese',
          name: 'Cheese Level',
          options: ['Light', 'Regular', 'Extra'],
          isRequired: false,
          additionalCost: 0
        }
      ],
      popularity: 85,
      rating: 4.8,
      reviewCount: 124
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'Wagyu Beef Steak',
      description: 'Premium A5 Wagyu beef with roasted vegetables and red wine reduction',
      price: 85.00,
      category: 'Main Course',
      image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      allergens: ['none'],
      dietaryTags: ['gluten-free'],
      preparationTime: 20,
      customizations: [
        {
          id: 'doneness',
          name: 'Doneness',
          options: ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done'],
          isRequired: true,
          additionalCost: 0
        }
      ],
      popularity: 95,
      rating: 4.9,
      reviewCount: 89
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
      name: 'Lobster Thermidor',
      description: 'Fresh lobster with creamy brandy sauce, gratinated with gruyere cheese',
      price: 48.00,
      category: 'Main Course',
      image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      allergens: ['shellfish', 'dairy'],
      dietaryTags: ['gluten-free'],
      preparationTime: 30,
      customizations: [],
      popularity: 78,
      rating: 4.7,
      reviewCount: 56
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
      name: 'Caesar Salad',
      description: 'Classic Caesar with romaine lettuce, parmesan, croutons, and anchovy dressing',
      price: 16.00,
      category: 'Appetizer',
      image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      allergens: ['dairy', 'gluten', 'fish'],
      dietaryTags: ['vegetarian'],
      preparationTime: 10,
      customizations: [],
      popularity: 92,
      rating: 4.6,
      reviewCount: 203
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
      price: 14.00,
      category: 'Dessert',
      image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      allergens: ['dairy', 'eggs', 'gluten'],
      dietaryTags: ['vegetarian'],
      preparationTime: 15,
      customizations: [
        {
          id: 'icecream',
          name: 'Ice Cream Flavor',
          options: ['Vanilla', 'Chocolate', 'Strawberry', 'None'],
          isRequired: false,
          additionalCost: 0
        }
      ],
      popularity: 88,
      rating: 4.8,
      reviewCount: 167
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439016'),
      name: 'Thai Green Curry',
      description: 'Aromatic green curry with coconut milk, vegetables, and jasmine rice',
      price: 22.00,
      category: 'Main Course',
      image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      allergens: ['coconut'],
      dietaryTags: ['vegan', 'gluten-free', 'spicy'],
      preparationTime: 18,
      customizations: [
        {
          id: 'spice',
          name: 'Spice Level',
          options: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
          isRequired: true,
          additionalCost: 0
        }
      ],
      popularity: 76,
      rating: 4.5,
      reviewCount: 98
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439017'),
      name: 'Craft Cocktail - Old Fashioned',
      description: 'Premium bourbon with bitters, sugar, and orange peel',
      price: 16.00,
      category: 'Beverages',
      image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      allergens: ['none'],
      dietaryTags: ['gluten-free'],
      preparationTime: 5,
      customizations: [],
      popularity: 82,
      rating: 4.7,
      reviewCount: 145
    },
    {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439018'),
      name: 'Artisan Coffee',
      description: 'Single-origin Ethiopian coffee, freshly roasted and expertly brewed',
      price: 6.00,
      category: 'Beverages',
      image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
      isAvailable: true,
      allergens: ['none'],
      dietaryTags: ['vegan', 'gluten-free'],
      preparationTime: 8,
      customizations: [
        {
          id: 'milk',
          name: 'Milk Type',
          options: ['None', 'Whole Milk', 'Oat Milk', 'Almond Milk', 'Soy Milk'],
          isRequired: false,
          additionalCost: 0
        }
      ],
      popularity: 94,
      rating: 4.6,
      reviewCount: 312
    }
  ]

  await MenuItem.deleteMany({})
  await MenuItem.insertMany(menuItems)
  console.log('✅ Menu items seeded successfully')
}

const seedTables = async () => {
  const tables = []
  
  for (let i = 1; i <= 20; i++) {
    const qrCode = `table_${i}_${Date.now()}`
    const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/table/${qrCode}`
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl)
    
    tables.push({
      number: i.toString(),
      capacity: Math.floor(Math.random() * 6) + 2, // 2-8 people
      status: 'available',
      qrCode,
      qrCodeImage,
      wifiCredentials: {
        ssid: process.env.RESTAURANT_WIFI_SSID || 'TableTap_Premium',
        password: process.env.RESTAURANT_WIFI_PASSWORD || 'Welcome2024'
      },
      location: {
        section: ['indoor', 'outdoor', 'private', 'bar'][Math.floor(Math.random() * 4)],
        floor: Math.floor(Math.random() * 3) + 1,
        coordinates: {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100)
        }
      },
      amenities: Math.random() > 0.5 ? ['window_view'] : [],
      isActive: true
    })
  }

  await Table.deleteMany({})
  await Table.insertMany(tables)
  console.log('✅ Tables seeded successfully')
}

const seedData = async () => {
  try {
    await connectDB()
    
    console.log('🌱 Starting data seeding...')
    
    await seedUsers()
    await seedMenuItems()
    await seedTables()
    
    console.log('🎉 All data seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedData()