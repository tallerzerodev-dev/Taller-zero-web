import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    title: string
    price: number
    image: string
    category: string
    size?: string // For products with multiple sizes
    color?: string // For products with multiple colors
    quantity: number
    maxStock: number
}

interface CartStore {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
    removeItem: (id: string, size?: string, color?: string) => void
    updateQuantity: (id: string, size: string | undefined, color: string | undefined, delta: number) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
                    )

                    if (existingItemIndex >= 0) {
                        // Update quantity if item exists
                        const nextItems = [...state.items]
                        const currentItem = nextItems[existingItemIndex]
                        nextItems[existingItemIndex] = {
                            ...currentItem,
                            quantity: Math.min(currentItem.quantity + (newItem.quantity || 1), currentItem.maxStock),
                        }
                        return { items: nextItems }
                    }

                    // Add new item
                    return { items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }] }
                })
            },

            removeItem: (id, size, color) => {
                set((state) => ({
                    items: state.items.filter((i) => !(i.id === id && i.size === size && i.color === color)),
                }))
            },

            updateQuantity: (id, size, color, delta) => {
                set((state) => {
                    return {
                        items: state.items.map((item) => {
                            if (item.id === id && item.size === size && item.color === color) {
                                const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.maxStock))
                                return { ...item, quantity: newQuantity }
                            }
                            return item
                        }),
                    }
                })
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0)
            },

            totalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
            },
        }),
        {
            name: 'taller-zero-cart', // localStorage key
        }
    )
)
