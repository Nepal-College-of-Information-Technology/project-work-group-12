import { MenuItem } from '../types'

export const menuItems: MenuItem[] = [
  {
    id: '666aa001a0f5c5123a0c0001',
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
      },
      {
        id: 'truffle',
        name: 'Truffle Intensity',
        options: ['Mild', 'Medium', 'Strong'],
        isRequired: false,
        additionalCost: 0
      }
    ]
  },
  {
    id: '666aa001a0f5c5123a0c0002',
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
    ]
  },
  {
    id: '666aa001a0f5c5123a0c0003',
    name: 'Lobster Thermidor',
    description: 'Fresh lobster with creamy brandy sauce, gratinated with gruyere cheese',
    price: 48.00,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailable: true,
    allergens: ['shellfish', 'dairy'],
    dietaryTags: ['gluten-free'],
    preparationTime: 30,
    customizations: [
      {
        id: 'spice',
        name: 'Spice Level',
        options: ['Mild', 'Medium', 'Spicy'],
        isRequired: false,
        additionalCost: 0
      }
    ]
  },
  {
    id: '666aa001a0f5c5123a0c0004',
    name: 'Caesar Salad',
    description: 'Classic Caesar with romaine lettuce, parmesan, croutons, and anchovy dressing',
    price: 16.00,
    category: 'Appetizer',
    image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailable: true,
    allergens: ['dairy', 'gluten', 'fish'],
    dietaryTags: ['vegetarian'],
    preparationTime: 10,
    customizations: [
      {
        id: 'dressing',
        name: 'Dressing Amount',
        options: ['Light', 'Regular', 'Extra'],
        isRequired: false,
        additionalCost: 0
      }
    ]
  },
  {
    id: '666aa001a0f5c5123a0c0005',
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
    ]
  },
  {
    id: '666aa001a0f5c5123a0c0006',
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
      },
      {
        id: 'protein',
        name: 'Add Protein',
        options: ['None', 'Tofu', 'Chicken', 'Shrimp'],
        isRequired: false,
        additionalCost: 5
      }
    ]
  },
  {
    id: '666aa001a0f5c5123a0c0007',
    name: 'Craft Cocktail - Old Fashioned',
    description: 'Premium bourbon with bitters, sugar, and orange peel',
    price: 16.00,
    category: 'Beverages',
    image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=400',
    isAvailable: true,
    allergens: ['alcohol'],
    dietaryTags: ['gluten-free'],
    preparationTime: 5,
    customizations: [
      {
        id: 'strength',
        name: 'Strength',
        options: ['Regular', 'Strong', 'Extra Strong'],
        isRequired: false,
        additionalCost: 0
      }
    ]
  },
  {
    id: '666aa001a0f5c5123a0c0008',
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
      },
      {
        id: 'sugar',
        name: 'Sweetener',
        options: ['None', 'Sugar', 'Honey', 'Stevia'],
        isRequired: false,
        additionalCost: 0
      }
    ]
  }
]
