import Joi from 'joi'

export const validateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'waiter', 'chef', 'customer').optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    })
  }
  next()
}

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    })
  }
  next()
}

export const validateOrder = (req, res, next) => {
  const schema = Joi.object({
    tableId: Joi.string().required(),
    items: Joi.array().items(
      Joi.object({
        menuItem: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        customizations: Joi.object().optional(),
        specialInstructions: Joi.string().max(200).optional()
      })
    ).min(1).required(),
    specialInstructions: Joi.string().max(500).allow('').optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    })
  }
  next()
}

export const validateMenuItem = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid('Appetizer', 'Main Course', 'Dessert', 'Beverages', 'Specials').required(),
    image: Joi.string().required(),
    isAvailable: Joi.boolean().optional(),
    allergens: Joi.array().items(Joi.string()).optional(),
    dietaryTags: Joi.array().items(Joi.string()).optional(),
    preparationTime: Joi.number().min(1).required(),
    customizations: Joi.array().optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    })
  }
  next()
}