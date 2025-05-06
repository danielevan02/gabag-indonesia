import { CartItem } from "@/types";
import { create } from "zustand";

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setOpenModal: (open: boolean) => void
};

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  isOpen: false,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => (item.variantId||item.productId) !== id),
    })),
  setOpenModal: (open) => set({ isOpen: open})
}));
