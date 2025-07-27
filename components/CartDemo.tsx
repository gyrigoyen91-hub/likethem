'use client'

import { useCart } from '@/contexts/CartContext'

const demoItems = [
  {
    id: 'item-1',
    name: 'Oversized Wool Coat',
    curator: 'Marcus Chen',
    price: 240,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: 'item-2',
    name: 'Minimalist Cotton Blazer',
    curator: 'Sofia Laurent',
    price: 289,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: 'item-3',
    name: 'Silk Evening Dress',
    curator: 'Isabella Rossi',
    price: 420,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  }
]

export default function CartDemo() {
  const { addItem, getItemCount, getSubtotal } = useCart()

  return (
    <div className="fixed bottom-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-30">
      <h3 className="font-serif text-sm font-light mb-3">Cart Demo</h3>
      <div className="space-y-2">
        {demoItems.map((item) => (
          <button
            key={item.id}
            onClick={() => addItem(item)}
            className="block w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
          >
            Add {item.name} (${item.price})
          </button>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
        <div>Items: {getItemCount()}</div>
        <div>Total: ${getSubtotal().toFixed(2)}</div>
      </div>
    </div>
  )
} 