 import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Clock, Leaf, Flame } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { MenuItem as MenuItemType } from '../types'
import { formatCurrency } from '../lib/utils'

interface MenuItemProps {
  item: MenuItemType
  onAddToOrder: (item: MenuItemType, customizations: Record<string, string>, specialInstructions?: string) => void
}

export function MenuItem({ item, onAddToOrder }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customizations, setCustomizations] = useState<Record<string, string>>({})
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleAddToOrder = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToOrder(item, customizations, specialInstructions)
    }
    setIsOpen(false)
    setQuantity(1)
    setCustomizations({})
    setSpecialInstructions('')
  }

  const getDietaryIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'vegetarian': return <Leaf className="w-4 h-4 text-green-600" />
      case 'spicy': return <Flame className="w-4 h-4 text-red-600" />
      default: return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-lg font-bold text-slate-800">
                  {formatCurrency(item.price)}
                </span>
              </div>
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                  <Badge variant="destructive" className="text-sm">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl text-slate-800">{item.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">{item.preparationTime}min</span>
                </div>
              </div>
              <CardDescription className="text-slate-600 leading-relaxed">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                {item.dietaryTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {getDietaryIcon(tag)}
                    <span className="ml-1">{tag}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-xl font-bold text-slate-800">
                {formatCurrency(item.price)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-slate-700 leading-relaxed mb-4">{item.description}</p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Prep time: {item.preparationTime} min</span>
              </div>
              <div className="flex items-center gap-2">
                {item.dietaryTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {getDietaryIcon(tag)}
                    <span className="ml-1">{tag}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {item.customizations.length > 0 && (
            <div className="space-y-4"  key={item?.id}>
              <h4 className="font-semibold text-slate-800">Customizations</h4>
              {item.customizations.map(customization => (
                <div key={customization.id} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {customization.name}
                    {customization.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={customizations[customization.id] || ''}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      [customization.id]: e.target.value
                    }))}
                  >
                    <option value="">Select option</option>
                    {customization.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Special Instructions (Optional)
            </label>
            <Textarea
              placeholder="e.g., less spicy, no onions, extra sauce..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleAddToOrder}
              disabled={!item.isAvailable}
              className="px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium"
            >
              Add to Order • {formatCurrency(item.price * quantity)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}