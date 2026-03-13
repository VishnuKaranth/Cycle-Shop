import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // unique id for the entry (slug + selections hash)
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
  selections: Record<string, {
    categoryId: string;
    categoryName: string;
    optionId: string;
    optionName: string;
    price: number;
  }>;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex((i) => i.id === item.id);

        const existingItem = currentItems[existingItemIndex];
        if (existingItemIndex > -1 && existingItem) {
          const newItems = [...currentItems];
          newItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + item.quantity
          };
          set({ items: newItems });
        } else {
          set({ items: [...currentItems, item] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, delta) => {
        const newItems = get().items.map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        });
        set({ items: newItems });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: "cycle-shop-cart",
    }
  )
);
