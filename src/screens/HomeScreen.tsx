import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  TextInput,
  Image,
  ImageSourcePropType,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { Svg, Path, Rect, G, Text as SvgText, Circle, Line, Polyline } from 'react-native-svg';
import { useLanguage } from "../context/LanguageContext";
import { getAllRestaurants, Restaurant } from '../services/RestaurantService';
import { useCart } from "../context/CartContext";
import { useLocation } from '../context/LocationContext';
import RestaurantSelectionView from '../components/RestaurantSelectionView';
import TimePicker from '../components/TimePicker';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Import images
const menuIcon: ImageSourcePropType = require('../assets/images/menu.png');
const locationIcon: ImageSourcePropType = require('../assets/images/placeholder.png');
const cartIcon: ImageSourcePropType = require('../assets/images/cart.png');
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const aiIcon: ImageSourcePropType = require('../assets/images/robot.png');
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');
// Add calendar and clock icons
const calendarIcon: ImageSourcePropType = require('../assets/images/calendar.png');
const clockIcon: ImageSourcePropType = require('../assets/images/clock.png');

// Tür tanımı düzeltildi
type HomeScreenNavProp = StackNavigationProp<RootStackParamList, "Home">;

// Define types for weekly plan
interface MenuItem {
  id: string;
  name?: string;
  isim?: string;
  price?: number;
  fiyat?: number;
}

// Extended Restaurant interface for our purposes
interface PlanRestaurant extends Restaurant {
  items?: MenuItem[];
  menuItems?: MenuItem[];
  name?: string;
  image?: string;
}

interface Selection {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  itemName: string;
  price: string;
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

interface CartItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  itemId: string;
  itemName: string;
  price: string;
  quantity: number;
  dayIndex: number;
  planId: string;
}

export default function HomeScreen() {
  // useNavigation düzeltildi
  const navigation = useNavigation<HomeScreenNavProp>();
  const [orderType, setOrderType] = useState<"weekly" | "daily">("daily");
  const [searchText, setSearchText] = useState("");
  const { t, language } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { getItemsCount } = useCart();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const { selectedAddress, addresses, currentLocation } = useLocation();
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [showRestaurantSelection, setShowRestaurantSelection] = useState(false);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState<{dayIndex: number, planId: string} | null>(null);
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

  // Safely access cart items count
  useEffect(() => {
    try {
      const intervalId = setInterval(() => {
        // Update cart count every second
        const count = getItemsCount();
        console.log(`HomeScreen: Cart count update: ${count}`);
        setCartItemsCount(count);
      }, 1000);
      
      return () => clearInterval(intervalId);
    } catch (error) {
      console.error("Error getting cart items count:", error);
      setCartItemsCount(0);
    }
  }, [getItemsCount]);

  // Force status bar to be light-content and make it visible on iOS
  useEffect(() => {
    // Ensure status bar is light content (white text)
    StatusBar.setBarStyle("light-content", true);

    // For Android, set the background color
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#00B2FF');
    }
  }, []);

  // Fetch restaurants from Firestore
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const restaurantsData = await getAllRestaurants();
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  // Initialize weekly plan
  useEffect(() => {
    setWeeklyPlan(generateWeeklyPlan());
  }, []);

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

  // Weekly plan functions
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
    setSelectedPlanInfo({
      dayIndex: activeDayIndex,
      planId
    });
    
    // Make sure restaurants have loaded before showing the selection view
    if (restaurants && restaurants.length > 0) {
      setShowRestaurantSelection(true);
    } else {
      // Show a message if no restaurants are available
      Alert.alert(
        "Bilgi",
        "Restoran bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.",
        [{ text: "Tamam", onPress: () => {} }]
      );
    }
  };
  
  // Close restaurant selection
  const closeRestaurantSelection = () => {
    setShowRestaurantSelection(false);
    setSelectedPlanInfo(null);
  };

  // Add item to cart
  const addItemToCart = (restaurantId: string, itemId: string) => {
    if (!selectedPlanInfo) return;
    
    const { dayIndex, planId } = selectedPlanInfo;
    // Use a type assertion to handle the restaurant structure
    const restaurant = restaurants.find(r => r.id === restaurantId) as any;
    if (!restaurant) return;
    
    // Find item from restaurant menu items, handle different possible structures
    let item;
    if (Array.isArray(restaurant.menuItems)) {
      item = restaurant.menuItems.find((i: any) => i.id === itemId);
    } else if (Array.isArray(restaurant.items)) {
      item = restaurant.items.find((i: any) => i.id === itemId);
    } else {
      console.error('Restaurant menu items not found');
      return;
    }
    
    if (!item) return;
    
    // Handle different price and name formats based on data structure
    const itemPrice = typeof item.fiyat === 'number' ? 
      `₺${item.fiyat.toFixed(2)}` : 
      item.fiyat ? `₺${item.fiyat}` : 
      typeof item.price === 'number' ? `₺${item.price.toFixed(2)}` : `₺0.00`;
    
    const cartItem: CartItem = {
      id: `item-${Date.now()}`,
      restaurantId,
      restaurantName: restaurant.isim || restaurant.name || 'Restaurant',
      restaurantImage: restaurant.logoUrl || restaurant.image || 'https://via.placeholder.com/100',
      itemId,
      itemName: item.isim || item.name || 'Item',
      price: itemPrice,
      quantity: 1,
      dayIndex,
      planId
    };
    
    // Add to cart (by day/plan)
    const cartKey = `${dayIndex}-${planId}`;
    
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      if (!updatedCart[cartKey]) {
        updatedCart[cartKey] = [];
      }
      updatedCart[cartKey].push(cartItem);
      return updatedCart;
    });
    
    // Add to header cart as well
    setHeaderCart(prev => [...prev, cartItem]);
    
    // Show cart actions
    setShowCartActions(true);
    
    // Show added to cart message
    Alert.alert(
      t('cart.added'),
      `${item.name || item.isim || 'Item'} ${t('cart.added.to')}`,
      [{ text: 'OK', onPress: () => {} }],
      { cancelable: true }
    );
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
      const price = parseFloat(item.price.replace('₺', '').replace(',', '.'));
      return total + (price * item.quantity);
    }, 0);
  };

  // Complete meal selection
  const completeMealSelection = () => {
    if (getCurrentCartItemCount() > 0) {
      addCartToSelection();
    }
    
    setShowRestaurantSelection(false);
    setSelectedPlanInfo(null);
  };

  // Add cart to selection
  const addCartToSelection = () => {
    if (!selectedPlanInfo) return;
    
    const { dayIndex, planId } = selectedPlanInfo;
    const cartKey = `${dayIndex}-${planId}`;
    const cartItems = cart[cartKey] || [];
    
    if (cartItems.length === 0) return;
    
    const updatedPlan = [...weeklyPlan];
    const planIndex = updatedPlan[dayIndex].plans.findIndex(plan => plan.id === planId);
    
    if (planIndex >= 0) {
      // Add cart items to plan selections
      cartItems.forEach(item => {
        updatedPlan[dayIndex].plans[planIndex].selections.push({
          id: item.id,
          restaurantName: item.restaurantName,
          restaurantImage: item.restaurantImage,
          itemName: item.itemName,
          price: item.price
        });
      });
      
      setWeeklyPlan(updatedPlan);
      
      // Clear cart
      setCart(prevCart => {
        const updatedCart = { ...prevCart };
        delete updatedCart[cartKey];
        return updatedCart;
      });
      
      // Clear header cart as well
      setHeaderCart([]);
      
      setShowCartActions(false);
    }
  };

  // Remove a selection from a plan
  const removeSelection = (planId: string, selectionId: string) => {
    const updatedPlan = [...weeklyPlan];
    const currentDay = updatedPlan[activeDayIndex];
    const planIndex = currentDay.plans.findIndex(plan => plan.id === planId);
    
    if (planIndex >= 0) {
      currentDay.plans[planIndex].selections = currentDay.plans[planIndex].selections.filter(
        selection => selection.id !== selectionId
      );
      setWeeklyPlan(updatedPlan);
    }
  };

  // Calculate total cost of plan
  const calculateTotalCost = () => {
    let total = 0;
    weeklyPlan.forEach(day => {
      day.plans.forEach(plan => {
        plan.selections.forEach(selection => {
          const price = selection.price.replace('₺', '').replace(',', '.');
          total += parseFloat(price) || 0;
        });
      });
    });
    
    return total;
  };

  // View restaurant details for WeeklyPlan
  const viewRestaurantDetails = (restaurantId: string) => {
    if (restaurantId) {
      navigation.navigate('MenuSelection', { restaurantId, orderType: 'weekly' });
    }
  };

  const selectedDay = selectedPlanInfo ? weeklyPlan[selectedPlanInfo.dayIndex] : null;
  const selectedPlan = selectedPlanInfo && selectedDay ? 
    selectedDay.plans.find(p => p.id === selectedPlanInfo.planId) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        {/* Top Navigation Bar */}
        <View style={styles.topNavBar}>
          <TouchableOpacity 
            style={styles.locationContainer} 
            activeOpacity={1.0}
            onPress={() => navigation.navigate('Addresses')}
          >
            <Image source={locationIcon} style={styles.locationIcon} />
            <Text style={styles.locationText}>
              {selectedAddress 
                ? selectedAddress.name 
                : addresses.length > 0 
                  ? t('location.select') 
                  : t('location.add')}
            </Text>
            <Text style={styles.locationArrow}>▼</Text>
          </TouchableOpacity>

          <View style={styles.placeholder} />

          <TouchableOpacity 
            style={styles.cartButton}
            activeOpacity={1.0}
            onPress={() => {
              console.log("Navigating to Cart from HomeScreen");
              navigation.navigate('Cart');
            }}
          >
            <Image source={cartIcon} style={styles.cartIcon} />
            {cartItemsCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <TouchableOpacity 
            style={styles.searchContainer}
            activeOpacity={1.0}
            onPress={() => navigation.navigate('Search')}
          >
            <Image source={searchIcon} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>{t('search.placeholder')}</Text>
          </TouchableOpacity>
        </View>

        {/* AI Question Section */}
        <TouchableOpacity style={styles.aiQuestionContainer} activeOpacity={1.0}>
          <Image source={aiIcon} style={styles.aiQuestionIcon} />
          <Text style={styles.aiQuestionText}>{t('ai.askQuestion')}</Text>
        </TouchableOpacity>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        <ScrollView 
          style={styles.contentContainer} 
          bounces={true} 
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {/* Toggle for Weekly/Daily Selection - Now in white section */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleWrapper}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  styles.leftToggleOption,
                  orderType === "weekly" && styles.activeToggle
                ]}
                activeOpacity={1.0}
                onPress={() => {
                  setOrderType("weekly");
                  if (showRestaurantSelection) {
                    closeRestaurantSelection();
                  }
                }}
              >
                <View style={styles.iconContainer}>
                  <Svg width="24" height="24" viewBox="0 0 24 24">
                    <G stroke={orderType === "weekly" ? "white" : "#777777"} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <Line x1="16" y1="2" x2="16" y2="6" />
                      <Line x1="8" y1="2" x2="8" y2="6" />
                      <Line x1="3" y1="10" x2="21" y2="10" />
                      <SvgText x="12" y="19" textAnchor="middle" fontSize="9" fontFamily="Arial" fill={orderType === "weekly" ? "white" : "#777777"}>7</SvgText>
                    </G>
                  </Svg>
                </View>
                <Text style={[
                  styles.toggleText,
                  orderType === "weekly" && styles.activeToggleText
                ]}>Haftalık</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  styles.rightToggleOption,
                  orderType === "daily" && styles.activeToggle
                ]}
                activeOpacity={1.0}
                onPress={() => {
                  setOrderType("daily");
                  if (showRestaurantSelection) {
                    closeRestaurantSelection();
                  }
                }}
              >
                <View style={styles.iconContainer}>
                  <Svg width="24" height="24" viewBox="0 0 24 24">
                    <G fill="none" stroke={orderType === "daily" ? "white" : "#777777"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <Circle cx="12" cy="12" r="10" />
                      <Polyline points="12 6 12 12 16 14" />
                    </G>
                  </Svg>
                </View>
                <Text style={[
                  styles.toggleText,
                  orderType === "daily" && styles.activeToggleText
                ]}>Günlük</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showRestaurantSelection ? (
            <RestaurantSelectionView
              restaurants={restaurants as any}
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
              goToCart={() => navigation.navigate('Cart')}
            />
          ) : orderType === "weekly" ? (
            // Weekly Plan Content
            <>
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
              <View style={styles.dayContent}>
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
                
                <View style={styles.planSlotsContainer}>
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
                              <Image 
                                source={{ uri: selection.restaurantImage || 'https://via.placeholder.com/100' }}
                                style={styles.mealThumbnail}
                              />
                              <View style={styles.mealInfo}>
                                <Text style={styles.mealName} numberOfLines={1}>{selection.itemName}</Text>
                                <Text style={styles.mealRestaurant} numberOfLines={1}>{selection.restaurantName}</Text>
                              </View>
                              <Text style={styles.mealPrice}>{selection.price}</Text>
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
              </View>
              
              {/* Footer with Total */}
              <View style={styles.footer}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Toplam:</Text>
                  <Text style={styles.totalAmount}>₺{calculateTotalCost().toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('Cart')}>
                  <Text style={styles.checkoutButtonText}>Siparişi Tamamla</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Daily Content (Restaurants)
            <>
              {/* Categories */}
              <View style={styles.categoriesContainer}>
                <Text style={styles.sectionTitle}>{t('home.popularCategories')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                  {[
                    {key: 'pizza', label: t('category.pizza')},
                    {key: 'burger', label: t('category.burger')},
                    {key: 'kebap', label: t('category.kebap')},
                    {key: 'cigkofte', label: 'Çiğ Köfte'},
                    {key: 'dessert', label: t('category.dessert')}
                  ].map((category, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.categoryItem} 
                      activeOpacity={1.0}
                      onPress={() => navigation.navigate('Search', { categoryFilter: category.label })}
                    >
                      <Text style={styles.categoryText}>{category.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Restaurants */}
              <View style={styles.restaurantsContainer}>
                <Text style={styles.sectionTitle}>{t('home.popularRestaurants')}</Text>
                {loading ? (
                  <ActivityIndicator color="#00B2FF" size="large" style={styles.loader} />
                ) : restaurants.length > 0 ? (
                  restaurants.map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      style={styles.restaurantItem}
                      activeOpacity={1.0}
                      onPress={() => navigation.navigate("MenuSelection", { 
                        orderType, 
                        restaurantId: restaurant.id 
                      })}
                    >
                      <View style={styles.restaurantImagePlaceholder}>
                        {restaurant.logoUrl ? (
                          <Image source={{ uri: restaurant.logoUrl }} style={styles.restaurantImage} />
                        ) : (
                          <View style={styles.restaurantImageFallback}>
                            <Text style={styles.restaurantImageFallbackText}>
                              {restaurant.isim.charAt(0)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{restaurant.isim}</Text>
                        <Text style={styles.restaurantDescription}>{restaurant.kategori}</Text>
                        {restaurant.adres && (
                          <Text style={styles.restaurantAddress} numberOfLines={1}>
                            {restaurant.adres}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noRestaurants}>{t('restaurant.none')}</Text>
                )}
              </View>
            </>
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]} activeOpacity={1.0}>
          <Image source={restaurantIcon} style={[styles.tabIcon, styles.activeTabIcon]} />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>{t('tabs.food')}</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          activeOpacity={1.0}
          onPress={() => navigation.navigate('Search')}
        >
          <Image source={searchIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.search')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          activeOpacity={1.0}
          onPress={() => navigation.navigate('Orders')}
        >
          <Image source={orderIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.orders')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          activeOpacity={1.0}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image source={userIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.profile')}</Text>
        </TouchableOpacity>
      </View>

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B2FF',
  },
  headerSection: {
    backgroundColor: '#00B2FF',
    paddingBottom: 10,
    paddingTop: Platform.OS === 'ios' ? 0 : 5,
    zIndex: 10,
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 5 : 10,
    paddingBottom: 5,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  menuIcon: {
    width: 32,
    height: 32,
    tintColor: 'white',
  },
  cartIcon: {
    width: 32,
    height: 32,
    tintColor: 'white',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  locationIcon: {
    width: 22,
    height: 22,
    marginRight: 5,
    tintColor: 'white',
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  locationArrow: {
    fontSize: 10,
    color: 'white',
    marginLeft: 5,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 44,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#666',
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#777',
    flex: 1,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
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
  tabIconSmall: {
    width: 22,
    height: 22,
    tintColor: '#777777',
    resizeMode: 'contain',
  },
  activeImage: {
    tintColor: 'white',
  },
  aiQuestionContainer: {
    marginHorizontal: 16,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiQuestionIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  aiQuestionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 5,
    width: '100%',
  },
  categoriesContainer: {
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  categoriesScroll: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  categoryItem: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  restaurantsContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  restaurantItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  restaurantImageFallback: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B2FF',
  },
  restaurantImageFallbackText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#00B2FF',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 12,
    color: '#777',
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  bottomTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    backgroundColor: 'white',
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 25 : 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    position: 'relative',
  },
  activeTabItem: {
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 40,
    height: 3,
    backgroundColor: '#00B2FF',
    alignSelf: 'center',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabIcon: {
    width: 24,
    height: 24,
    tintColor: '#888',
  },
  activeTabIcon: {
    tintColor: '#00B2FF',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    color: '#888',
  },
  activeTabLabel: {
    color: '#00B2FF',
    fontWeight: '500',
  },
  loader: {
    marginVertical: 20,
  },
  noRestaurants: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#777',
  },
  placeholder: {
    width: 30,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    padding: 15,
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
  planSlotsContainer: {
    paddingBottom: 70,
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
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 60,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B2FF',
  },
  checkoutButton: {
    backgroundColor: '#00B2FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  weeklyPlanHeader: {
    backgroundColor: '#00B2FF',
    padding: 15,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 5,
  },
  weeklyPlanHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});