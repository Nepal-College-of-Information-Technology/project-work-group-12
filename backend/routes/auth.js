import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { validateUser, validateLogin } from '../middleware/validation.js'

const router = express.Router()

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUser, async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer'
    })

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive
        },
        token
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password, tableId } = req.body

    console.log(req.body)
    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      })
    }

    // Check password
    // const isPasswordValid = await user.comparePassword(password)
    // if (!isPasswordValid) {
    //   return res.status(401).json({
    //     status: 'error',
    //     message: 'Invalid credentials'
    //   })
    // }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    if(tableId) {
      // Update tableId if provided
      user.tableId = tableId
      await user.save()
    }

    // Generate token
    const token = generateToken(user._id)

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          tableId: tableId || user.tableId,
          isActive: user.isActive,
          preferences: user.preferences
        },
        token
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar, preferences },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

export default router