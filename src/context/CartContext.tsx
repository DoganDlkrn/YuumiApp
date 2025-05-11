import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the structure of a cart item
export interface CartItem {
  id: string;
  name: string;
  price: number;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
}

// Define the context type
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItemsCount: () => number;
  getTotal: () => number;
}

// Cart storage key
const CART_STORAGE_KEY = '@yuumi_cart';

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    saveCart();
  }, [items]);

  // Add an item to the cart
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // If item exists, increase quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...currentItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Remove an item from the cart
  const removeItem = (itemId: string) => {
    setItems(currentItems => {
      // Find the item
      const existingItemIndex = currentItems.findIndex(i => i.id === itemId);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...currentItems];
        const currentQuantity = updatedItems[existingItemIndex].quantity;
        
        if (currentQuantity > 1) {
          // If quantity > 1, decrease quantity
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: currentQuantity - 1
          };
        } else {
          // If quantity is 1, remove the item
          updatedItems.splice(existingItemIndex, 1);
        }
        
        return updatedItems;
      }
      
      return currentItems;
    });
  };

  // Clear the cart
  const clearCart = () => {
    setItems([]);
  };

  // Get total number of items in cart
  const getItemsCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price of all items in cart
  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Context value
  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    getItemsCount,
    getTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    // Provider dışında kullanılırsa varsayılan boş değerler döndür
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      clearCart: () => {},
      getItemsCount: () => 0,
      getTotal: () => 0
    };
  }
  return context;
}; 