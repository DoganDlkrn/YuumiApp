import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Define the structure of a cart item
export interface CartItem {
  id: string;
  name: string;
  price: number;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
  planInfo?: {
    dayIndex: number;
    planId: string;
  };
}

// Define the context type
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => boolean;
  addItemWithQuantity: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItemsCount: () => number;
  getTotal: () => number;
  debugCart: () => void;
  syncWithWeeklyPlan: (weeklyPlan: any) => void;
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
          // console.log('Cart items:', JSON.stringify(parsedCart, null, 2)); // Daha az loglama için kapatıldı
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
        // console.log(`💾 Saving cart with ${items.length} items`); // Daha az loglama için kapatıldı
        // console.log('Cart items to save:', JSON.stringify(items, null, 2)); // Daha az loglama için kapatıldı
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        // console.log("✅ Cart saved successfully"); // Daha az loglama için kapatıldı
      } catch (error) {
        console.error('❌ Error saving cart:', error);
      }
    };

    if(items.length > 0) { // Sadece items gerçekten değiştiğinde kaydet
        saveCart();
    }
  }, [items]);

  // Add an item to the cart
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    console.log(`➕ CONTEXT: Adding item: ${item.name}, ID: ${item.id}, PlanInfo: ${JSON.stringify(item.planInfo)}`);
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      if (existingItemIndex >= 0) {
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
          name: item.name,
          price: item.price,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          planInfo: item.planInfo
        };
        console.log(`📝 CONTEXT: Updated quantity for ${item.name} to ${updatedItems[existingItemIndex].quantity}`);
        return updatedItems;
      } else {
        const newItem = { ...item, quantity: 1 };
        console.log('➕ CONTEXT: Adding new item:', JSON.stringify(newItem, null, 2));
        return [...currentItems, newItem];
      }
    });
    return true;
  };

  const addItemWithQuantity = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    if (quantity <= 0) return;
    console.log(`➕ CONTEXT: Adding ${quantity} of ${item.name} with quantity`);
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      if (existingItemIndex >= 0) {
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: quantity, // Set quantity directly
          name: item.name,
          price: item.price,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          planInfo: item.planInfo
        };
        return updatedItems;
      } else {
        return [...currentItems, { ...item, quantity }];
      }
    });
  };

  const removeItem = (itemId: string) => {
    console.log(`➖ CONTEXT: Removing item ID: ${itemId}`);
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(i => i.id === itemId);
      if (existingItemIndex >= 0) {
        const updatedItems = [...currentItems];
        if (updatedItems[existingItemIndex].quantity > 1) {
          updatedItems[existingItemIndex].quantity -= 1;
          console.log(`➖ CONTEXT: Decreased quantity for ${updatedItems[existingItemIndex].name}`);
          return updatedItems;
        } else {
          updatedItems.splice(existingItemIndex, 1);
          console.log(`➖ CONTEXT: Removed item ${itemId} completely`);
          return updatedItems;
        }
      }
      return currentItems;
    });
  };

  const clearCart = () => {
    console.log("🗑️ CONTEXT: Clearing cart");
    setItems([]);
  };

  const getItemsCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const debugCart = () => {
    console.log("🛒 CONTEXT DEBUG 🛒");
    console.log(`Total unique items: ${items.length}, Total quantity: ${getItemsCount()}`);
    if (items.length > 0) {
      items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (ID: ${item.id}, Qty: ${item.quantity}) Price: ${item.price}₺ Plan: ${JSON.stringify(item.planInfo)}`);
      });
      console.log(`Overall Total: ${getTotal().toFixed(2)} ₺`);
    } else {
      console.log("Cart is empty");
    }
  };

  const syncWithWeeklyPlan = (weeklyPlan: DayPlan[]) => { // DayPlan tipini kullan
    console.log('🔄 CONTEXT: Synchronizing cart with weekly plan');
    try {
      setItems(currentItems => {
        const regularItems = currentItems.filter(item => !item.planInfo);
        console.log(`🔄 CONTEXT: Preserved ${regularItems.length} regular items`);
        
        const planItems: CartItem[] = [];
        weeklyPlan.forEach((day, dayIndex) => {
          day.plans.forEach(plan => {
            plan.selections.forEach(selection => {
              try {
                let priceAsNumber = 0;
                if (typeof selection.price === 'string') {
                  priceAsNumber = parseFloat(selection.price.replace('₺', '').replace(',', '.'));
                  if (isNaN(priceAsNumber)) priceAsNumber = 0;
                } else if (typeof selection.price === 'number') {
                  priceAsNumber = selection.price;
                }
                
                planItems.push({
                  id: selection.id, // Bu ID'ler haftalık plandan geliyor
                  name: selection.itemName,
                  price: priceAsNumber,
                  restaurantId: (selection as any).restaurantId || 'unknown', // restaurantId eksik olabilir
                  restaurantName: selection.restaurantName,
                  quantity: 1, // Her zaman 1 olarak varsayıyoruz, çünkü sync global sepeti planla eşliyor
                  planInfo: {
                    dayIndex,
                    planId: plan.id
                  }
                });
              } catch (error) {
                console.error('❌ CONTEXT: Error processing selection:', selection, error);
              }
            });
          });
        });
        console.log(`🔄 CONTEXT: Found ${planItems.length} items in weekly plan`);
        const combinedItems = [...regularItems, ...planItems];
        console.log(`🔄 CONTEXT: Total items after sync: ${combinedItems.length}`);
        return combinedItems;
      });
    } catch (error) {
      console.error('❌ CONTEXT: Error synchronizing with weekly plan:', error);
    }
  };

  const value: CartContextType = {
    items,
    addItem,
    addItemWithQuantity,
    removeItem,
    clearCart,
    getItemsCount,
    getTotal,
    debugCart,
    syncWithWeeklyPlan
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context (artık aynı dosyada)
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
    // Acil durum için varsayılan değerler (uygulamada olmamalı)
    /*
    return {
      items: [],
      addItem: () => false,
      addItemWithQuantity: () => {},
      removeItem: () => {},
      clearCart: () => {},
      getItemsCount: () => 0,
      getTotal: () => 0,
      debugCart: () => {},
      syncWithWeeklyPlan: () => {}
    };
    */
  }
  return context;
};

// DayPlan interface (syncWithWeeklyPlan için)
interface DayPlan {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  plans: Plan[];
}

interface Plan { // Plan interface (DayPlan için)
  id: string;
  name: string;
  time: string;
  selections: Selection[]; // Selection interface (Plan için)
}

interface Selection { // Selection interface (Plan için)
  id: string;
  // restaurantId: string; // Bu CartItem'da var, burada zorunlu değilse kaldırılabilir
  restaurantName: string;
  // restaurantImage: string; // Bu CartItem'da var
  itemName: string;
  price: string | number; // price string ya da number olabilir
}

type CartScreenNavProp = StackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation() as CartScreenNavProp;
  const { items, removeItem, getTotal, clearCart, addItem, debugCart } = useCart();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  // Debug cart contents when screen is focused or items change
  useEffect(() => {
    console.log("CartScreen items updated or component mounted - debugging cart contents:");
    debugCart();
  }, [items, debugCart]);

  // Add useFocusEffect to debug cart when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("CartScreen focused - debugging cart contents:");
      debugCart();
      return () => {
        console.log("CartScreen unfocused");
      };
    }, [debugCart])
  );

  // Group items by restaurant
  const groupedItems = React.useMemo(() => {
    console.log(`CartScreen: Regrouping items - current cart has ${items.length} items`);
    const groups: { [restaurantId: string]: CartItem[] } = {};
    
    items.forEach(item => {
      const restaurantId = item.restaurantId || 'unknown_restaurant'; // Fallback
      if (!groups[restaurantId]) {
        groups[restaurantId] = [];
      }
      groups[restaurantId].push(item);
    });
    
    // console.log(`CartScreen: Grouped items into ${Object.keys(groups).length} restaurants`);
    // Object.keys(groups).forEach(restaurantId => {
    //   const restaurantItems = groups[restaurantId];
    //   console.log(`  Restaurant ${restaurantId} has ${restaurantItems.length} items:`);
    //   restaurantItems.forEach(it => console.log(`    - ${it.name} (ID: ${it.id}, Qty: ${it.quantity}, Plan: ${!!it.planInfo})`));
    // });
    
    return groups;
  }, [items]);

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    
    Alert.alert(
      t('cart.title'),
      t('cart.checkout'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('cart.checkout'),
          onPress: () => {
            Alert.alert('Başarılı', 'Siparişiniz alınmıştır.');
            clearCart();
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  const handleIncrement = (item: CartItem) => {
    console.log(`CartScreen: Incrementing item: ${item.name}, ID: ${item.id}, PlanInfo: ${JSON.stringify(item.planInfo)}`);
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      planInfo: item.planInfo
    });
  };

  const renderRestaurantSection = ({ restaurantId, items: restaurantItems }: { restaurantId: string, items: CartItem[] }) => {
    const restaurantName = restaurantItems[0]?.restaurantName || t('unknownRestaurant');
    
    return (
      <View style={styles.restaurantSection} key={restaurantId}>
        <Text style={styles.restaurantName}>{restaurantName}</Text>
        
        {restaurantItems.map(item => (
          <View style={styles.cartItem} key={`${item.id}-${item.restaurantId}-${item.planInfo?.dayIndex}-${item.planInfo?.planId}`}>
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName}>{item.name}</Text>
              {item.planInfo && (
                <Text style={styles.planInfoText}>
                  {`Plan: Gün ${item.planInfo.dayIndex + 1}, Plan ID: ${item.planInfo.planId.substring(0,6)}...`}
                </Text>
              )}
              <View style={styles.cartItemPriceRow}>
                <Text style={styles.cartItemPrice}>{item.price.toFixed(2)} ₺</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleIncrement(item)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.itemTotal}>
              <Text style={styles.itemTotalText}>
                {(item.price * item.quantity).toFixed(2)} ₺
              </Text>
            </View>
          </View>
        ))}
        
        <View style={styles.restaurantTotal}>
          <Text style={styles.restaurantTotalText}>{t('subtotal')}</Text>
          <Text style={styles.restaurantTotalAmount}>
            {restaurantItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} ₺
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme === 'dark' ? '#1e88e5' : '#00B2FF'} />

      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{"←"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('cart.title')}</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <View style={styles.whiteContainer}>
        {items.length > 0 ? (
          <FlatList
            data={Object.keys(groupedItems).map(restaurantId => ({
              restaurantId,
              items: groupedItems[restaurantId]
            }))}
            renderItem={({ item }) => renderRestaurantSection(item)}
            keyExtractor={item => item.restaurantId}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              <View style={styles.totalSection}>
                <Text style={styles.totalText}>{t('cart.total')}</Text>
                <Text style={styles.totalAmount}>{getTotal().toFixed(2)} ₺</Text>
                <TouchableOpacity 
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
                >
                  <Text style={styles.checkoutButtonText}>{t('completeOrder')}</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>{t('cart.empty')}</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>{t('orders.orderNow')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B2FF',
  },
  headerSection: {
    backgroundColor: '#00B2FF',
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    marginRight: 10,
  },
  placeholder: {
    width: 40,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  restaurantSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B2FF',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  cartItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  planInfoText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  cartItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  quantityButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    width: 25,
    textAlign: 'center',
    color: '#333',
  },
  itemTotal: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 10,
  },
  itemTotalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1, 
    borderTopColor: '#e0e0e0',
  },
  restaurantTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  restaurantTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B2FF',
  },
  totalSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cce7ff',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00B2FF',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#00B2FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#777',
    marginBottom: 20,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#00B2FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e88e5',
  },
  headerSection: {
    backgroundColor: '#1e88e5',
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
    marginRight: 10,
  },
  placeholder: {
    width: 40,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  restaurantSection: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4fc3f7',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  cartItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 2,
  },
  planInfoText: {
    fontSize: 12,
    color: '#9e9e9e',
    marginBottom: 4,
  },
  cartItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#bdbdbd',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4fc3f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#121212',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    width: 25,
    textAlign: 'center',
    color: '#e0e0e0',
  },
  itemTotal: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 10,
  },
  itemTotalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  restaurantTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1, 
    borderTopColor: '#333333',
  },
  restaurantTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bdbdbd',
  },
  restaurantTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4fc3f7',
  },
  totalSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#424242',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4fc3f7',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#4fc3f7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#9e9e9e',
    marginBottom: 20,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#4fc3f7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '600',
  },
}); 