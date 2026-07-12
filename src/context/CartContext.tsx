'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/components/ProductCard';

export type CartItem = Product & { quantity: number };

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem('velto_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('velto_cart', JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const addToCart = (product: Product) => {
    // Validate onlyMedicineEnabled block
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('velto_announcements');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          const configAnn = parsed.find((ann: any) => ann.title?.includes('[STORE_CONFIG]'));
          if (configAnn) {
            const config = JSON.parse(configAnn.content);
            if (config.onlyMedicineEnabled) {
              const cat = product.category?.toLowerCase() || '';
              const isMedicine = cat.includes('pharmacy') || cat.includes('medicine') || cat.includes('meds');
              if (!isMedicine) {
                alert("🚨 Ordering Restricted: Admin has restricted operations to Pharmacy/Medicine only. Grocery, Food, and Courier additions are locked.");
                return;
              }
            }
          }
        } catch (e) {}
      }
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
