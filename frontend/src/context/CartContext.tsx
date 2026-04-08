import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface CartItem {
  id: number;
  sku: string;
  name: string;
  price: number;
  unitOfMeasure: string;
  categoryName?: string;
  supplier?: string;
  quantity: number;
  maxQuantity: number; // receivedQuantity from stock
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback((incoming: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const addQty = incoming.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === incoming.id);
      if (existing) {
        return prev.map((i) =>
          i.id === incoming.id
            ? { ...i, quantity: Math.min(i.quantity + addQty, i.maxQuantity) }
            : i
        );
      }
      return [...prev, { ...incoming, quantity: Math.min(addQty, incoming.maxQuantity) }];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(qty, i.maxQuantity) } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addToCart, removeFromCart, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
