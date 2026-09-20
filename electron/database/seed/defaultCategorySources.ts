export interface DefaultCategoryWithSources {
  category: {
    name: string
    icon: string
    color: string
    description?: string
  }
  sources: string[]
}

export const DEFAULT_CATEGORY_SOURCES: DefaultCategoryWithSources[] = [
  {
    category: {
      name: 'Food & Drink',
      icon: 'Utensils',
      color: '#f97316',
      description: 'Daily meals, snacks, and beverage expenses'
    },
    sources: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks']
  },
  {
    category: {
      name: 'Transportation',
      icon: 'Car',
      color: '#3b82f6',
      description: 'Commuting, fuel, transit, and vehicle maintenance'
    },
    sources: ['Rides', 'Fuel', 'Parking', 'Public Transit', 'Maintenance']
  },
  {
    category: {
      name: 'Personal Care',
      icon: 'Sparkles',
      color: '#ec4899',
      description: 'Grooming, skincare, haircut, and personal hygiene'
    },
    sources: ['Skincare', 'Hair Care', 'Haircut', 'Personal Hygiene']
  },
  {
    category: {
      name: 'Clothing',
      icon: 'Shirt',
      color: '#8b5cf6',
      description: 'Apparel, footwear, and fashion accessories'
    },
    sources: ['Clothes', 'Shoes', 'Accessories']
  },
  {
    category: {
      name: 'Electronics',
      icon: 'Laptop',
      color: '#0ea5e9',
      description: 'Gadgets, digital devices, accessories, and repairs'
    },
    sources: ['Devices', 'Accessories', 'Repairs']
  },
  {
    category: {
      name: 'Entertainment',
      icon: 'Film',
      color: '#eab308',
      description: 'Movies, video games, social outings, and events'
    },
    sources: ['Movies', 'Games', 'Hanging Out', 'Events']
  },
  {
    category: {
      name: 'Hobbies',
      icon: 'Gamepad2',
      color: '#06b6d4',
      description: 'Model kits, board games, collectibles, and hobby supplies'
    },
    sources: ['Models', 'Board Games', 'Collectibles', 'Hobby Supplies']
  },
  {
    category: {
      name: 'Utilities',
      icon: 'Zap',
      color: '#10b981',
      description: 'Electricity, water, internet, and mobile recharges'
    },
    sources: ['Electricity', 'Internet', 'Water', 'Mobile Recharge']
  },
  {
    category: {
      name: 'Subscriptions',
      icon: 'CreditCard',
      color: '#6366f1',
      description: 'Recurring AI tools, streaming, software, and other services'
    },
    sources: ['AI', 'Streaming', 'Software', 'Other']
  },
  {
    category: {
      name: 'Household',
      icon: 'Home',
      color: '#14b8a6',
      description: 'Home supplies, furniture, storage solutions, and tools'
    },
    sources: ['Supplies', 'Furniture', 'Storage', 'Tools', 'Other']
  }
]
