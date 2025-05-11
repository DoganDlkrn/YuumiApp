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
  addItemWithQuantity: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItemsCount: () => number;
  getTotal: () => number;
  debugCart: () => void;
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
        console.log("⏳ Loading cart from AsyncStorage...");
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log(`✅ Cart loaded with ${parsedCart.length} items`);
          setItems(parsedCart);
        } else {
          console.log("🛒 No saved cart found");
        }
      } catch (error) {
        console.error('❌ Error loading cart:', error);
      }
    };

    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        console.log(`💾 Saving cart with ${items.length} items`);
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        console.log("✅ Cart saved successfully");
      } catch (error) {
        console.error('❌ Error saving cart:', error);
      }
    };

    saveCart();
  }, [items]);

  // Add an item to the cart
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    console.log(`➕ Adding item to cart: ${item.name} from ${item.restaurantName}`);
    
    setItems(currentItems => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // If item exists, increase quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
          // Ensure these properties are updated in case they've changed
          name: item.name,
          price: item.price,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName
        };
        console.log(`📝 Updated item quantity to ${updatedItems[existingItemIndex].quantity}`);
        return updatedItems;
      } else {
        // If item doesn't exist, add it with quantity 1
        const newItem = { ...item, quantity: 1 };
        console.log('➕ Adding new item with quantity 1');
        return [...currentItems, newItem];
      }
    });
  };

  // Add an item with a specific quantity
  const addItemWithQuantity = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    if (quantity <= 0) {
      console.log("⚠️ Attempted to add item with quantity <= 0, ignoring");
      return;
    }
    
    console.log(`➕ Adding ${quantity} of ${item.name} to cart`);
    
    setItems(currentItems => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // If item exists, update its quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          // Replace quantity instead of adding to it
          quantity: quantity,
          // Ensure these properties are updated in case they've changed
          name: item.name,
          price: item.price,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName
        };
        console.log(`📝 Set item quantity to ${quantity}`);
        return updatedItems;
      } else {
        // If item doesn't exist, add it with the specified quantity
        const newItem = { ...item, quantity };
        console.log(`➕ Adding new item with quantity ${quantity}`);
        return [...currentItems, newItem];
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

  // Debug cart contents
  const debugCart = () => {
    console.log("🛒 CART DEBUG 🛒");
    console.log(`Total items in cart: ${items.length}`);
    
    if (items.length > 0) {
      console.log("Items:");
      items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.quantity}x) - ${item.price} ₺ - From: ${item.restaurantName}`);
      });
      console.log(`Total: ${getTotal().toFixed(2)} ₺`);
    } else {
      console.log("Cart is empty");
    }
  };

  // Context value
  const value: CartContextType = {
    items,
    addItem,
    addItemWithQuantity,
    removeItem,
    clearCart,
    getItemsCount,
    getTotal,
    debugCart
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
      addItemWithQuantity: () => {},
      removeItem: () => {},
      clearCart: () => {},
      getItemsCount: () => 0,
      getTotal: () => 0,
      debugCart: () => {}
    };
  }
  return context;
}; 