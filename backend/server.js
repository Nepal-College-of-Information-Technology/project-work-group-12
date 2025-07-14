import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'
import tableRoutes from './routes/tables.js'
import notificationRoutes from './routes/notifications.js'
import analyticsRoutes from './routes/analytics.js'
import qrRoutes from './routes/qr.js'
import socketHandler from './socket/socketHandler.js'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
})

// Connect to MongoDB
connectDB()

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}))

// Body parsing middleware
app.use(express.json())

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Socket.IO handling
socketHandler(io)

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/qr', qrRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TableTap API is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  })
})

const PORT = process.env.PORT || 8000

server.listen(8000, () => {
  console.log(`🚀 TableTap server running on port`)
  console.log(`📱 Socket.IO server ready for real-time connections`)
})

export default app