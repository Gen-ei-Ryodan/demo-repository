import { create } from 'zustand'
import api from '@/lib/api'

interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: {
    id: number
    name: string
    slug: string
    price: number
    image: string | null
    image_url: string
    stock: number
    weight: number
    category: { id: number; name: string }
  }
}

interface Cart {
  id: number
  user_id: number
  cart_items: CartItem[]
}

interface CartState {
  cart: Cart | null
  loading: boolean
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: () => number
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart')
      set({ cart: data.cart })
    } catch {}
  },

  addItem: async (productId, quantity) => {
    const { data } = await api.post('/cart/add', { product_id: productId, quantity })
    set({ cart: data.cart })
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity })
    set({ cart: data.cart })
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`)
    set({ cart: data.cart })
  },

  clearCart: async () => {
    await api.delete('/cart')
    set({ cart: null })
  },

  itemCount: () => get().cart?.cart_items?.reduce((sum, i) => sum + i.quantity, 0) || 0,

  total: () => get().cart?.cart_items?.reduce((sum, i) => sum + i.product.price * i.quantity, 0) || 0,
}))
