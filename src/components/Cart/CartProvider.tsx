'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveCart, getCart, clearCart } from './cartService';
import {
  CartItem,
  CartContextType,
  CartStateContextType,
  CartDetailsContextType
} from './types';

const CartContext = createContext<CartContextType | null>(null);
const CartStateContext = createContext<CartStateContextType | null>(null);
const CartDetailsContext = createContext<CartDetailsContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const useCartState = () => {
  const context = useContext(CartStateContext);
  if (!context) {
    throw new Error('useCartState must be used within a CartProvider');
  }
  return context;
};

export const useCartDetails = () => {
  const context = useContext(CartDetailsContext);
  if (!context) {
    throw new Error('useCartDetails must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const total = cartItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const savedCart = await getCart();

        if (savedCart && Array.isArray(savedCart)) {
          setCartItems(savedCart);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        setError('Failed to load cart');
        console.error('Error loading cart:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);

  // Save cart state and persist
  const saveCartState = async (items: CartItem[]) => {
    try {
      setCartItems(items);
      await saveCart(items);
    } catch (err) {
      console.error('Failed to save cart:', err);
      setError('Failed to save cart');
    }
  };

  const addToCart = async (
    product: Omit<CartItem, 'cartId' | 'quantity'> & { _id: string },
    quantity: number
  ) => {
    try {
      setError(null);
      const existingIndex = cartItems.findIndex(item => item.cartId === product._id);
      let updatedItems: CartItem[];

      if (existingIndex !== -1) {
        updatedItems = [...cartItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity,
        };
      } else {
        const newItem: CartItem = {
          ...product,
          cartId: product._id,
          quantity,
        };
        updatedItems = [...cartItems, newItem];
      }

      await saveCartState(updatedItems);
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Error adding to cart:', err);
    }
  };

  const buyNow = async (
    product: Omit<CartItem, 'cartId' | 'quantity'> & { _id: string },
    quantity: number
  ) => {
    try {
      setError(null);

      const newItem: CartItem = {
        ...product,
        cartId: product._id,
        quantity,
      };

      const updatedItems: CartItem[] = [newItem];

      await saveCartState(updatedItems);
      await clearCart();

      localStorage.setItem('cartDetails', JSON.stringify({
        items: updatedItems,
        total: newItem.salePrice * quantity,
      }));

      window.location.href = '/pages/checkout';
    } catch (err) {
      setError('Failed to process Buy Now');
      console.error('Error in buyNow:', err);
    }
  };

  const removeFromCart = async (cartId: string) => {
    try {
      setError(null);
      const updatedItems = cartItems.filter(item => item.cartId !== cartId);
      await saveCartState(updatedItems);
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Error removing from cart:', err);
    }
  };

  const updateItemQuantity = async (cartId: string, type: 'increase' | 'decrease') => {
    try {
      setError(null);
      const updatedItems = cartItems
        .map(item => {
          if (item.cartId === cartId) {
            const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
            if (newQty < 1) return null;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      await saveCartState(updatedItems);
    } catch (err) {
      setError('Failed to update item quantity');
      console.error('Error updating quantity:', err);
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        buyNow,
        removeFromCart,
        updateItemQuantity,
        totalPrice: total,
        isLoading,
        error,
      }}
    >
      <CartStateContext.Provider
        value={{
          isCartOpen,
          toggleCart,
          itemCount: cartItems.length,
        }}
      >
        <CartDetailsContext.Provider
          value={{
            cartDetails: { items: cartItems, total },
            saveCartDetails: () => {}, // Deprecated, no longer needed with direct state
          }}
        >
          {children}
        </CartDetailsContext.Provider>
      </CartStateContext.Provider>
    </CartContext.Provider>
  );
};
