import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { MenuItem } from './MenuItem'
import { MenuItem as MenuItemType } from '../types'

interface MenuGridProps {
  items: MenuItemType[]
  onAddToOrder: (item: MenuItemType, customizations: Record<string, string>, specialInstructions?: string) => void
}

export function MenuGrid({ items, onAddToOrder }: MenuGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDietaryFilter, setSelectedDietaryFilter] = useState('all')

  const categories = ['all', ...new Set(items.map(item => item.category))]
  const dietaryOptions = ['all', ...new Set(items.flatMap(item => item.dietaryTags))]

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesDietary = selectedDietaryFilter === 'all' || item.dietaryTags.includes(selectedDietaryFilter)
    
    return matchesSearch && matchesCategory && matchesDietary
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 mr-2">Categories:</span>
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "luxury" : "outline"}
              className="cursor-pointer hover:bg-amber-50 transition-colors"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-600 mr-2">Dietary:</span>
          {dietaryOptions.map(option => (
            <Badge
              key={option}
              variant={selectedDietaryFilter === option ? "luxury" : "outline"}
              className="cursor-pointer hover:bg-amber-50 transition-colors"
              onClick={() => setSelectedDietaryFilter(option)}
            >
              {option === 'all' ? 'All' : option}
            </Badge>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <MenuItem  item={item} onAddToOrder={onAddToOrder} />
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No items found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}