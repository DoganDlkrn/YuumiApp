import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from './CartScreen';
import { CartItem } from './CartScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Svg, G, Rect, Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';
import RestaurantSelectionView from '../components/RestaurantSelectionView';
import TimePicker from '../components/TimePicker';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Define types for our plan data
interface Restaurant {
  id: string;
  name?: string;
  isim?: string;
  image?: string;
  logoUrl?: string;
  category?: string;
  kategori?: string;
  calismaSaatleri?: string;
  calismaSaatleri1?: string;
  address?: string;
  adres?: string;
  rating?: string;
  puan?: string;
  reviewCount?: string;
  deliveryTime?: string;
  teslimatSuresi?: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name?: string;
  isim?: string;
  price?: number;
  fiyat?: number;
}

interface Selection {
  id: string;
  restaurantId: string;
  restaurantName: string;
  itemName: string;
  price: number;
}

interface Plan {
  id: string;
  name: string;
  time: string;
  selections: Selection[];
}

interface DayPlan {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  plans: Plan[];
}

export default function WeeklyPlanScreen() {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(generateWeeklyPlan());
  const [showRestaurantSelection, setShowRestaurantSelection] = useState(false);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState<{dayIndex: number, planId: string} | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerConfig, setTimePickerConfig] = useState({
    planId: null as string | null,
    hours: 12,
    minutes: 0
  });
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState<Record<string, CartItem[]>>({});
  const [showCartActions, setShowCartActions] = useState(false);
  const [headerCart, setHeaderCart] = useState<CartItem[]>([]);
  
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { addItem, removeItem } = useCart();

  // Fetch restaurants from Firestore
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const restaurantsRef = collection(db, "restaurants");
        const restaurantsSnapshot = await getDocs(restaurantsRef);
        const restaurantsList: Restaurant[] = [];

        for (const restaurantDoc of restaurantsSnapshot.docs) {
          const restaurantData = {
            id: restaurantDoc.id,
            ...restaurantDoc.data(),
            items: []
          } as Restaurant;

          // Fetch menu items for each restaurant
          try {
            const menuRef = collection(db, "restaurants", restaurantDoc.id, "menu");
            const menuSnapshot = await getDocs(menuRef);
            
            if (!menuSnapshot.empty) {
              restaurantData.items = menuSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as MenuItem[];
            } else if ((restaurantData as any).menuItems && Array.isArray((restaurantData as any).menuItems)) {
              restaurantData.items = (restaurantData as any).menuItems;
            }
          } catch (error) {
            console.error(`Error fetching menu for restaurant ${restaurantDoc.id}:`, error);
          }

          restaurantsList.push(restaurantData);
        }

        setRestaurants(restaurantsList);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Load weekly plan from AsyncStorage on mount
  useEffect(() => {
    const loadWeeklyPlan = async () => {
      try {
        const savedPlan = await AsyncStorage.getItem('weeklyPlan');
        if (savedPlan) {
          setWeeklyPlan(JSON.parse(savedPlan));
          console.log('Loaded weekly plan from AsyncStorage');
        }
      } catch (error) {
        console.error('Error loading weekly plan:', error);
      }
    };
    
    loadWeeklyPlan();
  }, []);

  // Save weekly plan to AsyncStorage whenever it changes
  useEffect(() => {
    const saveWeeklyPlan = async () => {
      try {
        await AsyncStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
        console.log('Saved weekly plan to AsyncStorage');
      } catch (error) {
        console.error('Error saving weekly plan:', error);
      }
    };
    
    saveWeeklyPlan();
  }, [weeklyPlan]);

  // Sync with global cart when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('WeeklyPlanScreen focused, syncing with global cart');
      
      // First load the weekly plan from AsyncStorage if needed
      const loadAndSyncData = async () => {
        try {
          // Load weekly plan if not already loaded
          const savedPlan = await AsyncStorage.getItem('weeklyPlan');
          if (savedPlan) {
            const parsedPlan = JSON.parse(savedPlan);
            console.log('Loaded weekly plan from AsyncStorage on focus');
            setWeeklyPlan(parsedPlan);
          }
          
          // Then sync the weekly plan with the global cart
          setTimeout(() => {
            syncWeeklyPlanWithGlobalCart();
          }, 500); // Small delay to ensure weekly plan is loaded
        } catch (error) {
          console.error('Error loading/syncing data on focus:', error);
        }
      };
      
      loadAndSyncData();
      
      // Return cleanup function
      return () => {
        console.log('WeeklyPlanScreen unfocused');
      };
    }, [])
  );

  // Generate a weekly plan starting from today
  function generateWeeklyPlan(): DayPlan[] {
    const daysOfWeek = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    const weekPlan: DayPlan[] = [];
    
    for (let i = 0; i < 7; i++) {
      const planDate = new Date(today);
      planDate.setDate(today.getDate() + i);
      const dayNumber = planDate.getDay();
      
      // Get current time for the default time value
      const currentHour = today.getHours();
      const currentMinute = Math.ceil(today.getMinutes() / 5) * 5; // Round to nearest 5 minutes
      const defaultTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      weekPlan.push({
        id: i + 1,
        name: daysOfWeek[dayNumber],
        date: planDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
        completed: false,
        plans: [
          {
            id: `plan-${i}-1`,
            name: 'Plan 1',
            time: i === 0 ? defaultTime : '12:00',
            selections: []
          }
        ]
      });
    }
    
    return weekPlan;
  }

  // Navigating between days
  const goToNextDay = () => {
    if (activeDayIndex < weeklyPlan.length - 1) {
      setActiveDayIndex(activeDayIndex + 1);
    }
  };

  const goToPrevDay = () => {
    if (activeDayIndex > 0) {
      setActiveDayIndex(activeDayIndex - 1);
    }
  };

  const goToDay = (index: number) => {
    setActiveDayIndex(index);
  };

  // Complete the current day and move to next
  const completeCurrentDay = () => {
    const updatedPlan = [...weeklyPlan];
    updatedPlan[activeDayIndex].completed = true;
    setWeeklyPlan(updatedPlan);
    
    // Move to next day automatically if not the last day
    if (activeDayIndex < weeklyPlan.length - 1) {
      setActiveDayIndex(activeDayIndex + 1);
    }
  };

  // Add a new plan to the current day
  const addNewPlan = () => {
    const updatedPlan = [...weeklyPlan];
    const currentDay = updatedPlan[activeDayIndex];
    const newPlanNumber = currentDay.plans.length + 1;
    
    // Get current time for the default time value
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = Math.ceil(now.getMinutes() / 5) * 5; // Round to nearest 5 minutes
    const defaultTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    currentDay.plans.push({
      id: `plan-${activeDayIndex}-${newPlanNumber}`,
      name: `Plan ${newPlanNumber}`,
      time: defaultTime,
      selections: []
    });
    
    setWeeklyPlan(updatedPlan);
  };

  // Open time picker
  const openTimePicker = (planId: string) => {
    const plan = weeklyPlan[activeDayIndex].plans.find(p => p.id === planId);
    if (!plan) return;
    
    const [hours, minutes] = plan.time.split(':').map(Number);
    
    setTimePickerConfig({
      planId,
      hours,
      minutes
    });
    
    setShowTimePicker(true);
  };

  // Handle time changes in picker
  const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
    setTimePickerConfig(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Confirm time selection
  const confirmTimeSelection = () => {
    const { planId, hours, minutes } = timePickerConfig;
    if (!planId) return;
    
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    updatePlanTime(planId, formattedTime);
    setShowTimePicker(false);
  };

  // Update plan time
  const updatePlanTime = (planId: string, time: string) => {
    const updatedPlan = [...weeklyPlan];
    const currentDay = updatedPlan[activeDayIndex];
    const planIndex = currentDay.plans.findIndex(plan => plan.id === planId);
    
    if (planIndex >= 0) {
      currentDay.plans[planIndex].time = time;
      setWeeklyPlan(updatedPlan);
    }
  };

  // Open restaurant selection for a plan
  const openRestaurantSelection = (planId: string) => {
    console.log('[WeeklyPlanScreen] openRestaurantSelection triggered for planId:', planId, 'Active Day Index:', activeDayIndex);
    // Clear any previous selection data to avoid mixing plans
    setSelectedPlanInfo(null);
    setHeaderCart([]);
    setShowCartActions(false);
    
    // Set the new selection info
    const newSelectedPlanInfo = {
      dayIndex: activeDayIndex,
      planId
    };
    setSelectedPlanInfo(newSelectedPlanInfo);
    console.log('[WeeklyPlanScreen] selectedPlanInfo SET TO:', newSelectedPlanInfo);
    
    // Make sure restaurants have loaded before showing the selection view
    if (restaurants && restaurants.length > 0) {
      setShowRestaurantSelection(true);
      console.log('[WeeklyPlanScreen] setShowRestaurantSelection to true');
    } else {
      // Show a message if no restaurants are available
      Alert.alert(
        "Bilgi",
        "Restoran bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.",
        [{ text: "Tamam", onPress: () => {} }]
      );
      console.log('[WeeklyPlanScreen] Restaurants not loaded, Alert shown.');
    }
  };
  
  // Close restaurant selection
  const closeRestaurantSelection = () => {
    setShowRestaurantSelection(false);
    setSelectedPlanInfo(null);
  };

  // Add item to cart
  const addItemToCart = (restaurantId: string, itemId: string) => {
    console.log('[WeeklyPlanScreen][addItemToCart] TRIGGERED. restaurantId:', restaurantId, 'itemId:', itemId);
    console.log('[WeeklyPlanScreen][addItemToCart] current selectedPlanInfo:', selectedPlanInfo);
    if (!selectedPlanInfo) {
      console.error('[WeeklyPlanScreen][addItemToCart] selectedPlanInfo is NULL. Aborting.');
      return;
    }
    
    const { dayIndex, planId } = selectedPlanInfo;
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) {
      console.error('[WeeklyPlanScreen][addItemToCart] Restaurant not found for ID:', restaurantId);
      return;
    }
    
    const item = restaurant.items.find(i => i.id === itemId);
    if (!item) {
      console.error('[WeeklyPlanScreen][addItemToCart] Item not found for ID:', itemId, 'in restaurant', restaurantId);
      return;
    }
    
    let itemPriceNumber: number;
    if (typeof item.fiyat === 'number') {
      itemPriceNumber = item.fiyat;
    } else if (typeof item.fiyat === 'string') {
      itemPriceNumber = parseFloat(String(item.fiyat).replace('₺', '').replace(',', '.'));
    } else if (typeof item.price === 'number') {
      itemPriceNumber = item.price;
    } else if (typeof item.price === 'string') {
      itemPriceNumber = parseFloat(String(item.price).replace('₺', '').replace(',', '.'));
    } else {
      itemPriceNumber = 0;
    }
    if (isNaN(itemPriceNumber)) itemPriceNumber = 0;
    
    const itemNameFromDb = item.isim || item.name || 'Item';
    const restaurantName = restaurant.isim || restaurant.name || 'Restaurant';
    const uniqueId = `plan-${dayIndex}-${planId}-item-${Date.now()}`;
    
    const localCartItemForDisplay = {
      id: uniqueId,
      restaurantId,
      restaurantName,
      itemId, 
      name: itemNameFromDb, 
      price: itemPriceNumber, 
      quantity: 1,
      dayIndex,
      planId
    };
    console.log('[WeeklyPlanScreen][addItemToCart] localCartItemForDisplay created:', localCartItemForDisplay);
    
    const cartKey = `${dayIndex}-${planId}`;
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      if (!updatedCart[cartKey]) {
        updatedCart[cartKey] = [];
      }
      updatedCart[cartKey].push(localCartItemForDisplay);
      console.log('[WeeklyPlanScreen][addItemToCart] setCart CALLED. New cart for key', cartKey, ':', JSON.stringify(updatedCart[cartKey], null, 2));
      return updatedCart;
    });
    
    setHeaderCart(prev => [...prev, localCartItemForDisplay as any]);
    setShowCartActions(true);
    
    Alert.alert(
      t('cart.added'),
      `${itemNameFromDb} ${t('cart.added.to')}`,
      [{ text: 'OK', onPress: () => {} }],
      { cancelable: true }
    );
  };

  // Remove cart item
  const removeCartItem = (itemId: string) => {
    if (!selectedPlanInfo) return;
    
    const { dayIndex, planId } = selectedPlanInfo;
    const cartKey = `${dayIndex}-${planId}`;
    
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      if (!updatedCart[cartKey]) return prevCart;
      
      updatedCart[cartKey] = updatedCart[cartKey].filter(item => item.id !== itemId);
      
      if (updatedCart[cartKey].length === 0) {
        delete updatedCart[cartKey];
        setShowCartActions(false);
      }
      
      return updatedCart;
    });
    
    // Also remove from header cart
    setHeaderCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Get current cart item count
  const getCurrentCartItemCount = () => {
    if (!selectedPlanInfo) return 0;
    
    const { dayIndex, planId } = selectedPlanInfo;
    const cartKey = `${dayIndex}-${planId}`;
    
    return (cart[cartKey] || []).length;
  };

  // Calculate cart total
  const calculateCartTotal = () => {
    if (!selectedPlanInfo) return 0;
    
    const { dayIndex, planId } = selectedPlanInfo;
    const cartKey = `${dayIndex}-${planId}`;
    const items = cart[cartKey] || [];
    
    return items.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '0').replace('₺', '').replace(',', '.'));
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      return total + (price * quantity);
    }, 0);
  };

  // Add cart to selection
  const addCartToSelection = () => {
    console.log('[WeeklyPlanScreen][addCartToSelection] TRIGGERED.');
    console.log('[WeeklyPlanScreen][addCartToSelection] current selectedPlanInfo:', selectedPlanInfo);
    if (!selectedPlanInfo) {
      console.error('[WeeklyPlanScreen][addCartToSelection] selectedPlanInfo is NULL. Aborting.');
      return;
    }
  
    const { dayIndex, planId } = selectedPlanInfo;
    const cartKey = `${dayIndex}-${planId}`;
    const localPlanCartItems = cart[cartKey] || [];
    console.log(`[WeeklyPlanScreen][addCartToSelection] Items from local cart for key ${cartKey}:`, JSON.stringify(localPlanCartItems, null, 2));
  
    if (localPlanCartItems.length === 0) {
      console.log('[WeeklyPlanScreen][addCartToSelection] No items in local cart to add. Aborting.');
      return;
    }
  
    setWeeklyPlan(prevWeeklyPlan => {
      console.log('[WeeklyPlanScreen][addCartToSelection] setWeeklyPlan CALLED. prevWeeklyPlan (day of interest):\nDayIndex: ', dayIndex, 'PlanID: ', planId, 'Plan details:', JSON.stringify(prevWeeklyPlan[dayIndex]?.plans.find(p => p.id === planId), null, 2));
      const newWeeklyPlan = prevWeeklyPlan.map((day, dIndex) => {
        if (dIndex === dayIndex) {
          const newPlans = day.plans.map(p => {
            if (p.id === planId) {
              console.log(`[WeeklyPlanScreen][addCartToSelection] Updating plan: ${p.id} for day ${dIndex}`);
              const newSelections: Selection[] = [...p.selections];
              localPlanCartItems.forEach(localItem => {
                console.log('[WeeklyPlanScreen][addCartToSelection] Processing localItem for plan selection:', localItem);
                newSelections.push({
                  id: localItem.id,
                  restaurantId: localItem.restaurantId,
                  restaurantName: localItem.restaurantName,
                  itemName: localItem.name, 
                  price: localItem.price 
                });
                
                console.log('[WeeklyPlanScreen][addCartToSelection] Attempting to call global addItem for:', localItem.name, 'with planInfo:', { dayIndex, planId });
                try {
                  addItem({
                    id: localItem.id,
                    name: localItem.name,
                    price: localItem.price,
                    restaurantId: localItem.restaurantId,
                    restaurantName: localItem.restaurantName,
                    planInfo: { dayIndex, planId }
                  });
                  console.log(`[WeeklyPlanScreen][addCartToSelection] Global addItem SUCCEEDED for: ${localItem.name}`);
                } catch (error) {
                  console.error(`[WeeklyPlanScreen][addCartToSelection] Global addItem FAILED for: ${localItem.name}`, error);
                }
              });
              console.log(`[WeeklyPlanScreen][addCartToSelection] Plan ${p.id} newSelections:`, JSON.stringify(newSelections, null, 2));
              return { ...p, selections: newSelections };
            }
            return p;
          });
          return { ...day, plans: newPlans };
        }
        return day;
      });
      
      console.log('[WeeklyPlanScreen][addCartToSelection] About to save to AsyncStorage and sync with global cart.');
      try {
        AsyncStorage.setItem('weeklyPlan', JSON.stringify(newWeeklyPlan));
        console.log('[WeeklyPlanScreen][addCartToSelection] weeklyPlan SAVED to AsyncStorage.');
        syncWeeklyPlanWithGlobalCart();
      } catch (error) {
        console.error('[WeeklyPlanScreen][addCartToSelection] Error saving/syncing weekly plan:', error);
      }
      return newWeeklyPlan;
    });
    
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      delete updatedCart[cartKey];
      console.log('[WeeklyPlanScreen][addCartToSelection] Local cart for key', cartKey, 'CLEARED.');
      return updatedCart;
    });
    setHeaderCart([]);
    setShowCartActions(false);
    console.log('[WeeklyPlanScreen][addCartToSelection] FINISHED. Header cart cleared, actions hidden.');
  };
  
  // Sync the weekly plan with the global cart
  const syncWeeklyPlanWithGlobalCart = () => {
    console.log('Syncing weekly plan with global cart');
    try {
      const { syncWithWeeklyPlan } = useCart();
      syncWithWeeklyPlan(weeklyPlan);
    } catch (error) {
      console.error('Error syncing weekly plan with global cart:', error);
    }
  };

  // Clear cart
  const clearCart = () => {
    if (!selectedPlanInfo) return;
    
    const { dayIndex, planId } = selectedPlanInfo;
    const cartKey = `${dayIndex}-${planId}`;
    
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      delete updatedCart[cartKey];
      return updatedCart;
    });
    
    // Clear header cart as well
    setHeaderCart([]);
    
    setShowCartActions(false);
  };

  // Remove a selection from a plan
  const removeSelection = (planId: string, selectionId: string) => {
    // Use immutable update pattern
    setWeeklyPlan(prevWeeklyPlan => {
      const newWeeklyPlan = prevWeeklyPlan.map((day, dIndex) => {
        if (dIndex === activeDayIndex) {
          // Create a new copy of the day's plans
          const newPlans = day.plans.map(p => {
            if (p.id === planId) {
              // Find the selection to be removed
              const selectionToRemove = p.selections.find(
                selection => selection.id === selectionId
              );
              
              // Create a new copy of selections without the removed item
              const newSelections = p.selections.filter(
                selection => selection.id !== selectionId
              );
              
              // Also try to remove from global cart if it exists there
              if (selectionToRemove) {
                try {
                  console.log(`Removing item ${selectionId} from global cart`);
                  removeItem(selectionId);
                } catch (error) {
                  console.error('Error removing from global cart:', error);
                }
              }
              
              return { ...p, selections: newSelections };
            }
            return p;
          });
          
          return { ...day, plans: newPlans };
        }
        return day;
      });
      
      // Save the updated weekly plan to AsyncStorage
      try {
        AsyncStorage.setItem('weeklyPlan', JSON.stringify(newWeeklyPlan));
        console.log('Weekly plan saved to AsyncStorage after item removal');
        
        // Also sync the entire weekly plan with the global cart
        syncWeeklyPlanWithGlobalCart();
      } catch (error) {
        console.error('Error saving weekly plan:', error);
      }
      
      return newWeeklyPlan;
    });
  };

  // Complete meal selection
  const completeMealSelection = () => {
    console.log('CompleteMealSelection called');
    
    if (getCurrentCartItemCount() > 0) {
      console.log(`Adding ${getCurrentCartItemCount()} items from cart to selection`);
      addCartToSelection();
    }
    
    // Add a small delay to ensure state updates before UI changes
    setTimeout(() => {
      setShowRestaurantSelection(false);
      setSelectedPlanInfo(null);
      
      // Kullanıcıyı bilgilendirelim
      Alert.alert(
        "Bilgi",
        "Seçtiğiniz yemekler haftalık planınıza eklenmiştir.",
        [{ text: "Tamam", onPress: () => {} }]
      );
    }, 100);
  };

  // Calculate total cost of plan
  const calculateTotalCost = () => {
    let total = 0;
    weeklyPlan.forEach(day => {
      day.plans.forEach(plan => {
        plan.selections.forEach(selection => {
          total += selection.price;
        });
      });
    });
    
    return total;
  };

  // View restaurant details
  const viewRestaurantDetails = (restaurantId: string) => {
    if (restaurantId) {
      navigation.navigate('MenuSelection' as never, { restaurantId, orderType: 'weekly' } as never);
    }
  };

  // Go to cart
  const goToCart = () => {
    if (getCurrentCartItemCount() > 0) {
      // First add current cart to selection
      addCartToSelection();
    }
    
    // Make sure we're using the correct navigation method
    console.log('Navigating to Cart screen');
    setTimeout(() => {
      navigation.navigate('Cart' as never);
    }, 100); // Small delay to ensure state updates complete
  };

  const selectedDay = selectedPlanInfo ? weeklyPlan[selectedPlanInfo.dayIndex] : null;
  const selectedPlan = selectedPlanInfo && selectedDay ? 
    selectedDay.plans.find(p => p.id === selectedPlanInfo.planId) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />
      
      {showRestaurantSelection ? (
        <RestaurantSelectionView
          restaurants={restaurants}
          onClose={closeRestaurantSelection}
          onComplete={completeMealSelection}
          onAddToCart={addItemToCart}
          onViewRestaurant={viewRestaurantDetails}
          loading={loading}
          selectedDay={selectedDay?.name || ''}
          selectedDate={selectedDay?.date || ''}
          selectedTime={selectedPlan?.time || ''}
          cartItemCount={getCurrentCartItemCount()}
          cartTotal={calculateCartTotal()}
          goToCart={() => {
            console.log('GoToCart called from RestaurantSelectionView');
            // First add items to the plan before navigating
            if (getCurrentCartItemCount() > 0) {
              addCartToSelection();
            }
            // Add a small delay to ensure state updates before navigation
            setTimeout(() => {
              // Then navigate to cart
              navigation.navigate('Cart' as never);
            }, 100);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Haftalık Yemek Planı</Text>
          </View>
          
          {/* Weekly/Daily Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleWrapper}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  styles.leftToggleOption,
                  styles.activeToggle
                ]}
                activeOpacity={1.0}
              >
                <View style={styles.iconContainer}>
                  <Svg width="24" height="24" viewBox="0 0 24 24">
                    <G stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <Line x1="16" y1="2" x2="16" y2="6" />
                      <Line x1="8" y1="2" x2="8" y2="6" />
                      <Line x1="3" y1="10" x2="21" y2="10" />
                      <SvgText x="12" y="19" textAnchor="middle" fontSize="9" fontFamily="Arial" fill="white">7</SvgText>
                    </G>
                  </Svg>
                </View>
                <Text style={[styles.toggleText, styles.activeToggleText]}>Haftalık</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  styles.rightToggleOption
                ]}
                activeOpacity={1.0}
                onPress={() => navigation.navigate('Home')}
              >
                <View style={styles.iconContainer}>
                  <Svg width="24" height="24" viewBox="0 0 24 24">
                    <G fill="none" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <Circle cx="12" cy="12" r="10" />
                      <Polyline points="12 6 12 12 16 14" />
                    </G>
                  </Svg>
                </View>
                <Text style={styles.toggleText}>Günlük</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Days navigation - horizontal indicators */}
          <View style={styles.dayNavigation}>
            <TouchableOpacity style={styles.navArrow} onPress={goToPrevDay} disabled={activeDayIndex === 0}>
              <Text style={[styles.navArrowText, activeDayIndex === 0 && styles.disabledText]}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.dayIndicatorsContainer}>
              {weeklyPlan.map((day, index) => (
                <TouchableOpacity
                  key={day.id}
                  style={styles.dayIndicator}
                  onPress={() => goToDay(index)}
                >
                  <View style={[
                    styles.dayCircle,
                    index === activeDayIndex && styles.activeDayCircle,
                    day.completed && styles.completedDayCircle
                  ]}>
                    <Text style={[
                      styles.dayNumber,
                      (index === activeDayIndex || day.completed) && styles.activeDayNumber
                    ]}>{index + 1}</Text>
                  </View>
                  <Text style={styles.dayName}>{day.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.navArrow} 
              onPress={goToNextDay}
              disabled={activeDayIndex === weeklyPlan.length - 1}
            >
              <Text style={[
                styles.navArrowText,
                activeDayIndex === weeklyPlan.length - 1 && styles.disabledText
              ]}>→</Text>
            </TouchableOpacity>
          </View>
          
          {/* Day Content */}
          <ScrollView style={styles.dayContent} showsVerticalScrollIndicator={false}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>
                {weeklyPlan[activeDayIndex]?.name} - {weeklyPlan[activeDayIndex]?.date}
              </Text>
              
              <View style={styles.dayActions}>
                <TouchableOpacity 
                  style={styles.addPlanButton}
                  onPress={addNewPlan}
                >
                  <Text style={styles.addPlanButtonText}>+ Yeni Plan Ekle</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.completeDayButton,
                    weeklyPlan[activeDayIndex]?.completed && styles.disabledButton
                  ]}
                  onPress={completeCurrentDay}
                  disabled={weeklyPlan[activeDayIndex]?.completed}
                >
                  <Text style={styles.completeDayButtonText}>Günü Tamamla</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.planSlots}>
              {weeklyPlan[activeDayIndex]?.plans.map(plan => (
                <View key={plan.id} style={styles.planSlot}>
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <TouchableOpacity 
                      style={styles.timeSelector}
                      onPress={() => openTimePicker(plan.id)}
                    >
                      <Text style={styles.selectedTime}>{plan.time}</Text>
                      <Text style={styles.timeNote}>Saati değiştirmek için tıklayın</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.selectionsContainer}>
                    {plan.selections.length > 0 ? (
                      plan.selections.map(selection => (
                        <View key={selection.id} style={styles.mealSelection}>
                          <View style={styles.mealThumbnail}>
                            <Text style={{fontSize: 20}}>🍽️</Text>
                          </View>
                          <View style={styles.mealInfo}>
                            <Text style={styles.mealName} numberOfLines={1}>{selection.itemName}</Text>
                            <Text style={styles.mealRestaurant} numberOfLines={1}>{selection.restaurantName}</Text>
                          </View>
                          <Text style={styles.mealPrice}>{`₺${selection.price.toFixed(2)}`}</Text>
                          <TouchableOpacity 
                            style={styles.removeMealButton}
                            onPress={() => removeSelection(plan.id, selection.id)}
                          >
                            <Text style={styles.removeMealButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <TouchableOpacity 
                        style={styles.addMealButton}
                        onPress={() => openRestaurantSelection(plan.id)}
                      >
                        <Text style={styles.addMealButtonText}>+ Yemek Ekle</Text>
                      </TouchableOpacity>
                    )}
                    
                    {plan.selections.length > 0 && (
                      <TouchableOpacity 
                        style={styles.addMoreButton}
                        onPress={() => openRestaurantSelection(plan.id)}
                      >
                        <Text style={styles.addMoreButtonText}>+ Daha Fazla Yemek Ekle</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
            
            {/* Add padding at the bottom for better scrolling experience */}
            <View style={{ height: 50 }} />
          </ScrollView>
        </>
      )}

      {/* Time Picker Modal */}
      <TimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onConfirm={confirmTimeSelection}
        hours={timePickerConfig.hours}
        minutes={timePickerConfig.minutes}
        onChangeHours={(hours) => handleTimeChange('hours', hours)}
        onChangeMinutes={(minutes) => handleTimeChange('minutes', minutes)}
        isToday={activeDayIndex === 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    backgroundColor: '#00B2FF',
    padding: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  toggleContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  toggleWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 30,
    overflow: 'hidden',
    width: 280,
    height: 46,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  leftToggleOption: {
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  },
  rightToggleOption: {
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  activeToggle: {
    backgroundColor: '#00B2FF',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  activeToggleText: {
    color: 'white',
    fontWeight: '600',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dayNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  navArrow: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  navArrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B2FF',
  },
  disabledText: {
    opacity: 0.3,
  },
  dayIndicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    flex: 1,
    paddingHorizontal: 10,
    position: 'relative',
  },
  dayConnector: {
    position: 'absolute',
    top: '45%',
    left: '5%',
    right: '5%',
    height: 2,
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  dayIndicator: {
    alignItems: 'center',
    zIndex: 2,
    width: 40,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeDayCircle: {
    backgroundColor: '#00B2FF',
    borderColor: '#00B2FF',
  },
  completedDayCircle: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dayNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  activeDayNumber: {
    color: '#fff',
  },
  dayName: {
    fontSize: 12,
    marginTop: 5,
    color: '#777',
  },
  dayContent: {
    flex: 1,
    padding: 15,
    paddingBottom: 0,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dayActions: {
    flexDirection: 'row',
  },
  addPlanButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  addPlanButtonText: {
    fontSize: 12,
    color: '#333',
  },
  completeDayButton: {
    backgroundColor: '#00B2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  completeDayButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  planSlots: {
    flex: 1,
    paddingBottom: 20,
  },
  planSlot: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  planName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 15,
  },
  timeSelector: {
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedTime: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timeNote: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  selectionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  mealSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  mealThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  mealRestaurant: {
    fontSize: 12,
    color: '#777',
  },
  mealPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#00B2FF',
  },
  removeMealButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMealButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addMealButton: {
    borderWidth: 1,
    borderColor: '#00B2FF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMealButtonText: {
    color: '#00B2FF',
    fontWeight: 'bold',
  },
  addMoreButton: {
    marginTop: 10,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  addMoreButtonText: {
    color: '#555',
  },
}); 