'use client'
import { create } from 'zustand'

export interface CartItem {
  id: number
  nama: string
  harga: number
  satuan: string
  icon: string
  jumlah: number
  petani_id: string
  stok: number
}

interface CartStore {
  items: CartItem[]
  userId: string | null
  addItem: (item: Omit<CartItem, 'jumlah'>) => void
  removeItem: (id: number) => void
  updateQty: (id: number, jumlah: number) => void
  clearCart: () => void
  loadCart: (userId: string) => void
  saveCart: (userId: string, items: CartItem[]) => void
  switchUser: (userId: string | null) => void
  total: () => number
  count: () => number
}

// Key localStorage per user
const cartKey = (userId: string) => `agrimarket-cart-${userId}`

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  userId: null,

  // Load keranjang dari localStorage untuk user tertentu
  loadCart: (userId: string) => {
    try {
      const saved = localStorage.getItem(cartKey(userId))
      const items = saved ? JSON.parse(saved) : []
      set({ items, userId })
    } catch {
      set({ items: [], userId })
    }
  },

  // Simpan keranjang ke localStorage
  saveCart: (userId: string, items: CartItem[]) => {
    try {
      localStorage.setItem(cartKey(userId), JSON.stringify(items))
    } catch {}
  },

  // Switch user — load keranjang user baru
  switchUser: (userId: string | null) => {
    if (!userId) {
      set({ userId: null })
      return
    }
    try {
      const saved = localStorage.getItem(cartKey(userId))
      const items = saved ? JSON.parse(saved) : []
      set({ items, userId })
    } catch {
      set({ items: [], userId })
    }
  },

  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.id === item.id)
    let newItems
    if (existing) {
      newItems = state.items.map((i) =>
        i.id === item.id ? { ...i, jumlah: Math.min(i.jumlah + 1, i.stok) } : i
      )
    } else {
      newItems = [...state.items, { ...item, jumlah: 1 }]
    }
    if (state.userId) get().saveCart(state.userId, newItems)
    return { items: newItems }
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.items.filter((i) => i.id !== id)
    if (state.userId) get().saveCart(state.userId, newItems)
    return { items: newItems }
  }),

  updateQty: (id, jumlah) => set((state) => {
    const newItems = state.items.map((i) =>
      i.id === id ? { ...i, jumlah: Math.max(1, Math.min(jumlah, i.stok)) } : i
    )
    if (state.userId) get().saveCart(state.userId, newItems)
    return { items: newItems }
  }),

  clearCart: () => set((state) => {
    if (state.userId) localStorage.removeItem(cartKey(state.userId))
    return { items: [] }
  }),

  total: () => get().items.reduce((sum, i) => sum + i.harga * i.jumlah, 0),
  count: () => get().items.reduce((sum, i) => sum + i.jumlah, 0),
}))