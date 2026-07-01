// =============================================
// src/store/cartStore.ts
// Global state untuk keranjang belanja (Zustand)
// =============================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

type CartStore = {
  items: CartItem[]
  addItem: (product: Product, quantity: number, size: string) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity, size) => {
        const items = get().items
        const existing = items.find(i => i.product.id === product.id && i.size === size)
        if (existing) {
          set({
            items: items.map(i =>
              i.product.id === product.id && i.size === size
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, { product, quantity, size }] })
        }
      },

      removeItem: (productId, size) => {
        set({ items: get().items.filter(i => !(i.product.id === productId && i.size === size)) })
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }
        set({
          items: get().items.map(i =>
            i.product.id === productId && i.size === size ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'pepper-strap-cart', // key di localStorage browser pelanggan
      storage: createJSONStorage(() => localStorage),
    }
  )
)
