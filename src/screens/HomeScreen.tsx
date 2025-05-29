/*
 * ANA SAYFA EKRANI (HomeScreen)
 * 
 * Bu ekran uygulamanın ana sayfasıdır ve şu temel işlevleri içerir:
 * 
 * 1. HAFTALIK PLANLAMA SİSTEMİ:
 *    - 7 günlük yemek planı oluşturma
 *    - Her gün için birden fazla öğün planı (kahvaltı, öğle, akşam vb.)
 *    - Plan öğelerine restoran ve menü seçimi
 *    - Zamanlamaya göre plan düzenleme
 * 
 * 2. GÜNLÜK SİPARİŞ SİSTEMİ:
 *    - Hızlı tek seferlik sipariş verme
 *    - Sepet yönetimi ve kontrol
 *    - Anında sipariş işlemleri
 * 
 * 3. AI CHEF BOT:
 *    - Yapay zeka destekli yemek önerisi
 *    - Kullanıcı tercihlerine göre öneri
 *    - Chat tabanlı etkileşim
 * 
 * 4. RESTORAN YÖNETİMİ:
 *    - Restoranları listeleme ve filtreleme
 *    - Restoran detayları ve menülerini görüntüleme
 *    - Restoran bazlı sipariş işlemleri
 * 
 * Kritik State Yapıları:
 * - weeklyPlan: DayPlan[] - 7 günlük plan verisi
 * - restaurants: Restaurant[] - Firestore'dan gelen restoran listesi
 * - cart: Record<string, CartItem[]> - Sepet verilerinin yönetimi
 * - orderType: "weekly" | "daily" - Sipariş türü kontrolü
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
import { getAllRestaurants, Restaurant, getRestaurantMenu, getRestaurantById } from '../services/RestaurantService';
import { useCart } from "./CartScreen";
import { useLocation } from '../context/LocationContext';
import { calculateDeliveryTime, calculateAveragePrice } from '../utils/deliveryUtils';
import RestaurantSelectionView from '../components/RestaurantSelectionView';
import TimePicker from '../components/TimePicker';
import BottomTabBar from '../components/BottomTabBar';
import AiChefBot from '../components/AiChefBot';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  itemName: string;
  itemImage?: string;
  price: string;
  quantity?: number;
  itemId?: string;
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
  const { getItemsCount, addItem, removeItem, items } = useCart();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const { selectedAddress, addresses, currentLocation, getCurrentLocation } = useLocation();

  // Get current location when component mounts
  useEffect(() => {
    if (!currentLocation) {
      getCurrentLocation();
    }
  }, []);
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
  const [showAiChatbot, setShowAiChatbot] = useState(false);
  const [showRestaurantDetail, setShowRestaurantDetail] = useState<{
    restaurant: any;
    activeTab: 'menu' | 'reviews' | 'info';
  } | null>(null);
  
  // Track item quantities for UI display
  const [itemQuantities, setItemQuantities] = useState<{[key: string]: number}>({});
  
  // Get current quantity for an item in the current plan
  const getCurrentItemQuantity = (itemId: string): number => {
    if (orderType === "weekly" && selectedPlanInfo) {
      const { dayIndex, planId } = selectedPlanInfo;
      const day = weeklyPlan[dayIndex];
      if (!day?.plans) return 0;
      
      const plan = day.plans.find(p => p.id === planId);
      if (!plan?.selections) return 0;
      
      const selection = plan.selections.find(s => s.itemId === itemId);
      return selection?.quantity || 0;
    } else if (orderType === "daily") {
      // For daily mode, count items in the global cart
      const cartItems = items.filter(item => item.id.includes(itemId) || item.name === itemId);
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    }
    
    return 0;
  };

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

  // Firestore'dan restoranları çekme işlevi
  // Fetch restaurants from Firestore
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        console.log("HomeScreen: Fetching restaurants from Firestore...");
        const restaurantsData = await getAllRestaurants();
        console.log(`HomeScreen: Fetched ${restaurantsData.length} restaurants`);
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('HomeScreen: Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  // AsyncStorage'dan haftalık planı yükleme işlevi
  // Load weekly plan from AsyncStorage
  useEffect(() => {
    const loadWeeklyPlan = async () => {
      try {
        console.log("HomeScreen: Loading weekly plan from AsyncStorage...");
        const savedPlan = await AsyncStorage.getItem('@weekly_plan');
        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          console.log("HomeScreen: Loaded weekly plan:", parsedPlan);
          setWeeklyPlan(parsedPlan);
        } else {
          console.log("HomeScreen: No saved plan found, generating new one");
          const newPlan = generateWeeklyPlan();
          setWeeklyPlan(newPlan);
          await AsyncStorage.setItem('@weekly_plan', JSON.stringify(newPlan));
        }
      } catch (error) {
        console.error('HomeScreen: Error loading weekly plan:', error);
        // Fallback to generate a new plan
        const newPlan = generateWeeklyPlan();
        setWeeklyPlan(newPlan);
      }
    };

    loadWeeklyPlan();
  }, []);

  // 7 günlük yemek planı oluşturma fonksiyonu
  // Bu fonksiyon başlangıçta boş bir haftalık plan şablonu oluşturur
  function generateWeeklyPlan(): DayPlan[] {
    const daysOfWeek = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const today = new Date();
    
    console.log('Generating weekly plan for:', daysOfWeek[today.getDay()], today.toLocaleDateString('tr-TR'));
    
    const weekPlan: DayPlan[] = [];
    
    for (let i = 0; i < 7; i++) {
      const planDate = new Date(today);
      planDate.setDate(today.getDate() + i);
      const dayNumber = planDate.getDay(); // 0=Pazar, 1=Pazartesi, 2=Salı vb.
      
      // Get current time for the default time value
      const currentHour = today.getHours();
      const currentMinute = Math.ceil(today.getMinutes() / 5) * 5; // Round to nearest 5 minutes
      const defaultTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Format date properly - show day and date
      const formattedDate = planDate.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long' 
      });
      
      // Day name logic - bugün hangi günse ondan başlasın
      const dayName = daysOfWeek[dayNumber];
      const displayName = dayName; // Basit gün adı, ek işaret yok
      
      weekPlan.push({
        id: i + 1,
        name: displayName,
        date: formattedDate,
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
    
    console.log('Generated plan days:', weekPlan.map(d => d.name));
    
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
    console.log('[HomeScreen] openRestaurantSelection triggered for planId:', planId, 'Active Day Index:', activeDayIndex);
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
    console.log('[HomeScreen] selectedPlanInfo SET TO:', newSelectedPlanInfo);
    
    // Make sure restaurants have loaded before showing the selection view
    if (restaurants && restaurants.length > 0) {
      setShowRestaurantSelection(true);
      console.log('[HomeScreen] setShowRestaurantSelection to true');
    } else {
      // Show a message if no restaurants are available
      Alert.alert(
        "Bilgi",
        "Restoran bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.",
        [{ text: "Tamam", onPress: () => {} }]
      );
      console.log('[HomeScreen] Restaurants not loaded, Alert shown.');
    }
  };
  
  // Close restaurant selection
  const closeRestaurantSelection = () => {
    setShowRestaurantSelection(false);
    setSelectedPlanInfo(null);
  };

  // AI Chatbot için sepete ekleme fonksiyonu
  const handleAiAddToCart = (restaurantId: string, restaurantName: string, itemId: string, itemName: string, quantity: number = 1) => {
    try {
      // Global sepete ekle
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
          name: itemName,
          price: 0, // AI chatbot fiyat bilgisi vermediği için 0
          restaurantId,
          restaurantName
        });
      }
      
      Alert.alert(
        "Başarılı",
        `${itemName} sepetinize eklendi!`,
        [{ text: "Tamam", onPress: () => {} }]
      );
    } catch (error) {
      console.error('AI Chatbot sepete ekleme hatası:', error);
      Alert.alert(
        "Hata",
        "Ürün sepete eklenirken bir sorun oluştu.",
        [{ text: "Tamam", onPress: () => {} }]
      );
    }
  };

  // Doğrudan haftalık plana ürün ekleyen fonksiyon
  const addDirectlyToPlan = async (restaurantId: string, itemId: string): Promise<boolean> => {
    console.log('[HomeScreen][addDirectlyToPlan] BAŞLADI - restaurantId:', restaurantId, 'itemId:', itemId);
    
    if (!selectedPlanInfo) {
      console.error('[HomeScreen][addDirectlyToPlan] selectedPlanInfo NULL. İşlem iptal ediliyor.');
      return false;
    }
    
    const { dayIndex, planId } = selectedPlanInfo;
    console.log(`[HomeScreen][addDirectlyToPlan] dayIndex: ${dayIndex}, planId: ${planId}`);
    
    // Restoranı bul
    const restaurant = restaurants.find(r => r.id === restaurantId) as any;
    if (!restaurant) {
      console.error('[HomeScreen][addDirectlyToPlan] Restoran bulunamadı:', restaurantId);
      return false;
    }
    
    // Önce menü verilerini Firebase'den çekmeyi dene
    let item: any = null;
    
    try {
      const menuItems = await getRestaurantMenu(restaurantId);
      if (menuItems && menuItems.length > 0) {
        item = menuItems.find((i: any) => i.id === itemId);
        console.log('[HomeScreen][addDirectlyToPlan] Menü Firebase subcollection\'dan bulundu:', item);
      }
    } catch (error) {
      console.log('[HomeScreen][addDirectlyToPlan] Firebase subcollection hatası:', error);
    }
    
    // Eğer Firebase'den bulunamadıysa, restaurant objesinden ara
    if (!item) {
      console.log('[HomeScreen][addDirectlyToPlan] Restaurant state\'den aranıyor...');
      if (Array.isArray(restaurant.menu)) {
        item = restaurant.menu.find((i: any) => i.id === itemId);
        console.log('[HomeScreen][addDirectlyToPlan] restaurant.menu\'dan bulundu:', item);
      } else if (Array.isArray(restaurant.menuItems)) {
        item = restaurant.menuItems.find((i: any) => i.id === itemId);
        console.log('[HomeScreen][addDirectlyToPlan] restaurant.menuItems\'dan bulundu:', item);
      } else if (Array.isArray(restaurant.items)) {
        item = restaurant.items.find((i: any) => i.id === itemId);
        console.log('[HomeScreen][addDirectlyToPlan] restaurant.items\'dan bulundu:', item);
      }
    }
    
    if (!item) {
      console.error('[HomeScreen][addDirectlyToPlan] Ürün hiçbir yerde bulunamadı:', itemId);
      return false;
    }
    
    // Fiyatı hesapla
    let itemPrice = 0;
    if (typeof item.fiyat === 'number') {
      itemPrice = item.fiyat;
    } else if (typeof item.fiyat === 'string') {
      itemPrice = parseFloat(String(item.fiyat).replace('₺', '').replace(',', '.'));
    } else if (typeof item.price === 'number') {
      itemPrice = item.price;
    } else if (typeof item.price === 'string') {
      itemPrice = parseFloat(String(item.price).replace('₺', '').replace(',', '.'));
    }
    if (isNaN(itemPrice)) itemPrice = 0;
    
    // Ürün ve restoran adını al
    const itemName = item.isim || item.name || 'Ürün';
    const restaurantName = restaurant.isim || restaurant.name || 'Restoran';
    
    try {
      // Yeni selection oluştur
      const newSelection = {
        id: `direct-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        restaurantId: restaurantId,
        restaurantName,
        restaurantImage: restaurant.logoUrl || restaurant.image || 'https://via.placeholder.com/100',
        itemName,
        itemImage: restaurant.logoUrl || restaurant.image || 'https://via.placeholder.com/80', // Ürün resmi yerine restoran logosu kullanılıyor
        price: `₺${itemPrice.toFixed(2)}`,
        quantity: 1
      };
      
      console.log(`[HomeScreen][addDirectlyToPlan] Yeni selection oluşturuldu:`, newSelection);
      
      // AsyncStorage'dan en güncel planı al ve güncelle
      const savedPlanStr = await AsyncStorage.getItem('weeklyPlan');
      let currentWeeklyPlan = savedPlanStr ? JSON.parse(savedPlanStr) : JSON.parse(JSON.stringify(weeklyPlan));
      
      // Günü ve planı bul
      if (!currentWeeklyPlan[dayIndex]) {
        console.error(`[HomeScreen][addDirectlyToPlan] Gün bulunamadı, index: ${dayIndex}`);
        return false;
      }
      
      if (!currentWeeklyPlan[dayIndex].plans) {
        currentWeeklyPlan[dayIndex].plans = [];
      }
      
      // Planı bul veya oluştur
      let planIndex = currentWeeklyPlan[dayIndex].plans.findIndex(p => p.id === planId);
      if (planIndex === -1) {
        // Plan yoksa ekle
        currentWeeklyPlan[dayIndex].plans.push({
          id: planId,
          name: `Plan ${currentWeeklyPlan[dayIndex].plans.length + 1}`,
          time: '12:00',
          selections: []
        });
        planIndex = currentWeeklyPlan[dayIndex].plans.length - 1;
      }
      
      const plan = currentWeeklyPlan[dayIndex].plans[planIndex];
      
      // Selections dizisinin varlığını kontrol et
      if (!plan.selections) {
        plan.selections = [];
      }
      
      // Aynı item için existing selection'ı ara
      const existingSelectionIndex = plan.selections.findIndex(s => 
        s.restaurantId === restaurantId && s.itemName === itemName
      );
      
      if (existingSelectionIndex !== -1) {
        // Mevcut selection'ın quantity'sini artır
        const existingSelection = plan.selections[existingSelectionIndex];
        existingSelection.quantity = (existingSelection.quantity || 1) + 1;
        console.log(`[HomeScreen][addDirectlyToPlan] Existing selection quantity artırıldı: ${existingSelection.quantity}`);
      } else {
        // Yeni selection ekle
        plan.selections.push({
          ...newSelection,
          itemId: itemId // itemId'yi de ekliyoruz tracking için
        });
        console.log(`[HomeScreen][addDirectlyToPlan] Yeni selection eklendi, plan artık ${plan.selections.length} seçim içeriyor`);
      }
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('weeklyPlan', JSON.stringify(currentWeeklyPlan));
      console.log('[HomeScreen][addDirectlyToPlan] Plan AsyncStorage\'a kaydedildi');
      
      // State'i güncelle
      setWeeklyPlan(currentWeeklyPlan);
      console.log('[HomeScreen][addDirectlyToPlan] State güncellendi');
      
      // Global sepete de ekle
      try {
        addItem({
          id: newSelection.id,
          name: newSelection.itemName,
          price: itemPrice,
          restaurantId: restaurantId,
          restaurantName: newSelection.restaurantName,
          planInfo: { dayIndex, planId }
        });
        console.log('[HomeScreen][addDirectlyToPlan] Global sepete eklendi');
      } catch (error) {
        console.error('[HomeScreen][addDirectlyToPlan] Global sepete eklenirken hata:', error);
      }
      
      // UI'ı zorla yenile
      setTimeout(() => {
        setWeeklyPlan(prevPlan => [...JSON.parse(JSON.stringify(currentWeeklyPlan))]);
      }, 100);
      // Alert kaldırıldı - doğrudan quantity artırma olarak değiştirildi
      
      return true;
    } catch (error) {
      console.error('[HomeScreen][addDirectlyToPlan] Kritik hata:', error);
      return false;
    }
  };

  // Remove item from cart
  const removeItemFromCart = async (restaurantId: string, itemId: string): Promise<boolean> => {
    console.log('[HomeScreen][removeItemFromCart] TRIGGERED. restaurantId:', restaurantId, 'itemId:', itemId);
    
    if (orderType === "weekly" && selectedPlanInfo) {
      // For weekly plan mode, find and decrease the selection quantity
      const { dayIndex, planId } = selectedPlanInfo;
      const day = weeklyPlan[dayIndex];
      if (!day?.plans) return false;
      
      const plan = day.plans.find(p => p.id === planId);
      if (!plan?.selections) return false;
      
      const selection = plan.selections.find(s => s.itemId === itemId);
      if (selection) {
        await updateSelectionQuantity(planId, selection.id, -1);
        return true;
      }
      return false;
    } else {
      // For daily mode, remove from regular cart
      try {
        removeItem(itemId);
        return true;
      } catch (error) {
        console.error('[HomeScreen][removeItemFromCart] Error removing from cart:', error);
        return false;
      }
    }
  };

  // Add item to cart
  const addItemToCart = async (restaurantId: string, itemId: string): Promise<boolean> => {
    console.log('[HomeScreen][addItemToCart] TRIGGERED. restaurantId:', restaurantId, 'itemId:', itemId);
    console.log('[HomeScreen][addItemToCart] current selectedPlanInfo:', selectedPlanInfo);
    if (!selectedPlanInfo) {
      console.error('[HomeScreen][addItemToCart] selectedPlanInfo is NULL. Aborting.');
      return false;
    }
    
    const { dayIndex, planId } = selectedPlanInfo;
    const restaurant = restaurants.find(r => r.id === restaurantId) as any;
    if (!restaurant) {
      console.error('[HomeScreen][addItemToCart] Restaurant not found for ID:', restaurantId);
      return false;
    }
    
    let item: MenuItem | undefined;
    if (Array.isArray(restaurant.menuItems)) {
      item = restaurant.menuItems.find((i: any) => i.id === itemId);
    } else if (Array.isArray(restaurant.items)) {
      item = restaurant.items.find((i: any) => i.id === itemId);
    }
    
    if (!item) {
      console.error('[HomeScreen][addItemToCart] Item not found for ID:', itemId, 'in restaurant', restaurantId);
      return false;
    }
    
    const itemPrice = typeof item.fiyat === 'number' ? 
      item.fiyat : 
      (typeof item.fiyat === 'string' && !isNaN(parseFloat(item.fiyat))) ? parseFloat(item.fiyat) : // Handle string fiyat
      typeof item.price === 'number' ? item.price : 
      (typeof item.price === 'string' && !isNaN(parseFloat(item.price))) ? parseFloat(item.price) : 0; // Handle string price
    
    const itemPriceFormatted = `₺${itemPrice.toFixed(2)}`;
    const itemName = item.isim || item.name || 'Item';
    const restaurantName = restaurant.isim || restaurant.name || 'Restaurant';
    const uniqueId = `plan-${dayIndex}-${planId}-item-${Date.now()}`;
    
    const cartItem: CartItem = {
      id: uniqueId,
      restaurantId,
      restaurantName,
      restaurantImage: restaurant.logoUrl || restaurant.image || 'https://via.placeholder.com/100',
      itemId,
      itemName,
      price: itemPriceFormatted, // HomeScreen'deki CartItem price string bekliyor
      quantity: 1,
      dayIndex,
      planId
    };
    console.log('[HomeScreen][addItemToCart] localCartItem (for HomeScreen CartItem type) created:', cartItem);
    
    const cartKey = `${dayIndex}-${planId}`;
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      if (!updatedCart[cartKey]) {
        updatedCart[cartKey] = [];
      }
      updatedCart[cartKey].push(cartItem);
      console.log('[HomeScreen][addItemToCart] setCart CALLED. New cart for key', cartKey, ':', JSON.stringify(updatedCart[cartKey], null, 2));
      return updatedCart;
    });
    
    setHeaderCart(prev => [...prev, cartItem]);
    setShowCartActions(true);
    
    Alert.alert(
      t('cart.added'),
      `${itemName} ${t('cart.added.to')}`,
      [{ text: 'OK', onPress: () => {} }],
      { cancelable: true }
    );
    
    return true;
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
  const completeMealSelection = async () => {
    console.log('[HomeScreen][completeMealSelection] STARTED');
    
    try {
      const itemCount = getCurrentCartItemCount();
      console.log(`[HomeScreen][completeMealSelection] Current cart has ${itemCount} items`);
      
      let success = true;
      if (itemCount > 0) {
        console.log(`[HomeScreen][completeMealSelection] Adding ${itemCount} items to plan`);
        success = await addCartToSelection();
        
        if (success) {
          console.log('[HomeScreen][completeMealSelection] Items successfully added to plan');
        } else {
          console.error('[HomeScreen][completeMealSelection] Failed to add items to plan');
        }
      } else {
        console.log('[HomeScreen][completeMealSelection] No items to add');
      }
      
      // Close restaurant selection
    setShowRestaurantSelection(false);
    setSelectedPlanInfo(null);
      
    // Ensure we stay in weekly mode after completing meal selection
    setOrderType("weekly");
      
      if (success && itemCount > 0) {
        Alert.alert(
          "Başarılı",
          `${itemCount} yemek haftalık planınıza eklenmiştir.`,
          [{ text: "Tamam", onPress: () => {} }]
        );
      }
      
    } catch (error) {
      console.error('[HomeScreen][completeMealSelection] Error:', error);
      
      setShowRestaurantSelection(false);
      setSelectedPlanInfo(null);
      
      Alert.alert(
        "Hata",
        "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        [{ text: "Tamam", onPress: () => {} }]
      );
    }
  };

  // Add cart to selection - Fixed and improved
  const addCartToSelection = async (): Promise<boolean> => {
    console.log('[HomeScreen][addCartToSelection] STARTED');
    
    if (!selectedPlanInfo) {
      console.error('[HomeScreen][addCartToSelection] selectedPlanInfo is NULL');
      return false;
    }
  
    const { dayIndex, planId } = selectedPlanInfo;
    const cartKey = `${dayIndex}-${planId}`;
    const localPlanCartItems = cart[cartKey] || [];
    
    console.log(`[HomeScreen][addCartToSelection] Processing items for day ${dayIndex}, plan ${planId}`);
    console.log(`[HomeScreen][addCartToSelection] cart[${cartKey}]: ${localPlanCartItems.length} items`);

    if (localPlanCartItems.length === 0) {
      console.log('[HomeScreen][addCartToSelection] No items to add');
      return true; // Not an error, just nothing to add
    }
    
    try {
      // Create deep copy of current weekly plan for safe updates
      const updatedWeeklyPlan = JSON.parse(JSON.stringify(weeklyPlan));
      
      // Find the day and plan
      const day = updatedWeeklyPlan[dayIndex];
      if (!day?.plans) {
        console.error(`[HomeScreen][addCartToSelection] Invalid day at index ${dayIndex}`);
        return false;
      }
      
      const planIndex = day.plans.findIndex(p => p.id === planId);
      if (planIndex === -1) {
        console.error(`[HomeScreen][addCartToSelection] Plan ${planId} not found`);
        return false;
      }
      
      const targetPlan = day.plans[planIndex];
      
      // Ensure selections is initialized as an array
      if (!targetPlan.selections || !Array.isArray(targetPlan.selections)) {
        console.log('[HomeScreen][addCartToSelection] Initializing selections array');
        targetPlan.selections = [];
      }
      
      // Convert cart items to selections
      localPlanCartItems.forEach((localItem, index) => {
        // Extract price from string format (₺X.XX)
        const priceString = localItem.price.replace('₺', '').replace(',', '.');
        const priceNumber = parseFloat(priceString);
        
        if (isNaN(priceNumber)) {
          console.error(`[HomeScreen][addCartToSelection] Invalid price format: ${localItem.price}`);
          return; // Skip this item
        }
        
        // Add to plan selections
        targetPlan.selections.push({
          id: localItem.id,
          restaurantName: localItem.restaurantName,
          restaurantImage: localItem.restaurantImage,
          itemName: localItem.itemName,
          price: localItem.price
        });

        // Add to global cart
          try {
            addItem({
              id: localItem.id,
              name: localItem.itemName,
            price: priceNumber,
              restaurantId: localItem.restaurantId,
              restaurantName: localItem.restaurantName,
              planInfo: { dayIndex, planId }
            });
          } catch (error) {
          console.error('[HomeScreen][addCartToSelection] Error adding to global cart:', error);
          }
      });
      
      console.log(`[HomeScreen][addCartToSelection] Added ${localPlanCartItems.length} selections. Plan now has ${targetPlan.selections.length} total selections`);
      
      // Update state immediately - this is crucial!
      setWeeklyPlan(updatedWeeklyPlan);
      console.log('[HomeScreen][addCartToSelection] Updated state immediately');
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('weeklyPlan', JSON.stringify(updatedWeeklyPlan));
      console.log('[HomeScreen][addCartToSelection] Saved to AsyncStorage');
      
      // Clear local cart for this plan
    setCart(prevCart => {
      const updatedCart = { ...prevCart };
      delete updatedCart[cartKey];
      return updatedCart;
    });
      
    setHeaderCart([]);
    setShowCartActions(false);
      
      // Force a re-render by creating a completely new reference
      setTimeout(() => {
        setWeeklyPlan(prevPlan => [...JSON.parse(JSON.stringify(updatedWeeklyPlan))]);
      }, 100);
      
      console.log('[HomeScreen][addCartToSelection] SUCCESS');
    
      // Show success message
    Alert.alert(
      "Başarılı",
      "Seçtiğiniz yemekler haftalık planınıza eklendi!",
      [{ text: "Tamam", onPress: () => {} }]
    );
      
      return true;
      
    } catch (error) {
      console.error('[HomeScreen][addCartToSelection] ERROR:', error);
      return false;
    }
  };

  // Update selection quantity
  const updateSelectionQuantity = async (planId: string, selectionId: string, change: number) => {
    console.log(`[HomeScreen][updateSelectionQuantity] Updating quantity for selection ${selectionId} in plan ${planId}, change: ${change}`);
    
    try {
      // Create a deep copy of current weekly plan
      const updatedWeeklyPlan = JSON.parse(JSON.stringify(weeklyPlan));
      
      // Find the day and plan
      const day = updatedWeeklyPlan[activeDayIndex];
      if (!day?.plans) {
        console.error(`[HomeScreen][updateSelectionQuantity] Invalid day at index ${activeDayIndex}`);
        return;
      }
      
      const planIndex = day.plans.findIndex(p => p.id === planId);
      if (planIndex === -1) {
        console.error(`[HomeScreen][updateSelectionQuantity] Plan ${planId} not found`);
        return;
      }
      
      const targetPlan = day.plans[planIndex];
      const selectionIndex = targetPlan.selections?.findIndex(s => s.id === selectionId) ?? -1;
      
      if (selectionIndex === -1) {
        console.error(`[HomeScreen][updateSelectionQuantity] Selection ${selectionId} not found`);
        return;
      }
      
      const selection = targetPlan.selections[selectionIndex];
      const currentQuantity = selection.quantity || 1;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      if (newQuantity === 0) {
        // Remove the selection if quantity becomes 0
        await removeSelection(planId, selectionId);
        return;
      }
      
      // Update quantity
      selection.quantity = newQuantity;
              
      // Global sepette de quantity güncelle
      try {
        if (change > 0) {
          // Artırma durumunda item'ı sepete ekle
          addItem({
            id: selectionId,
            name: selection.itemName,
            price: parseFloat(selection.price.replace('₺', '').replace(',', '.')),
            restaurantId: selection.restaurantId,
            restaurantName: selection.restaurantName,
            planInfo: { dayIndex: activeDayIndex, planId }
          });
        } else if (change < 0) {
          // Azaltma durumunda item'ı sepetten çıkar
                  removeItem(selectionId);
        }
                } catch (error) {
        console.error('[HomeScreen][updateSelectionQuantity] Error updating global cart:', error);
                }
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('weeklyPlan', JSON.stringify(updatedWeeklyPlan));
      console.log('[HomeScreen][updateSelectionQuantity] Saved to AsyncStorage');
      
      // Update state
      setWeeklyPlan(updatedWeeklyPlan);
      console.log('[HomeScreen][updateSelectionQuantity] Updated state');
      
      // Force UI refresh
      setTimeout(() => {
        setWeeklyPlan(prevPlan => [...JSON.parse(JSON.stringify(updatedWeeklyPlan))]);
      }, 100);
      
                } catch (error) {
      console.error('[HomeScreen][updateSelectionQuantity] Error:', error);
                }
  };
      
  // Remove a selection from a plan
  const removeSelection = async (planId: string, selectionId: string) => {
    console.log(`[HomeScreen][removeSelection] Removing selection ${selectionId} from plan ${planId}`);
    
    try {
      // Create a deep copy of current weekly plan
      const updatedWeeklyPlan = JSON.parse(JSON.stringify(weeklyPlan));
      
      // Find the day and plan
      const day = updatedWeeklyPlan[activeDayIndex];
      if (!day?.plans) {
        console.error(`[HomeScreen][removeSelection] Invalid day at index ${activeDayIndex}`);
        return;
      }
      
      const planIndex = day.plans.findIndex(p => p.id === planId);
      if (planIndex === -1) {
        console.error(`[HomeScreen][removeSelection] Plan ${planId} not found`);
        return;
      }
      
      const targetPlan = day.plans[planIndex];
      const initialCount = targetPlan.selections?.length || 0;
      
      // Remove the selection
      targetPlan.selections = targetPlan.selections?.filter(
        selection => selection.id !== selectionId
      ) || [];
      
      if (targetPlan.selections.length === initialCount) {
        console.warn(`[HomeScreen][removeSelection] Selection ${selectionId} not found`);
        return;
      }
      
      console.log(`[HomeScreen][removeSelection] Plan now has ${targetPlan.selections.length} selections`);
      
      // Save to AsyncStorage first
      await AsyncStorage.setItem('weeklyPlan', JSON.stringify(updatedWeeklyPlan));
      console.log('[HomeScreen][removeSelection] Saved to AsyncStorage');
      
      // Update state
      setWeeklyPlan(updatedWeeklyPlan);
      console.log('[HomeScreen][removeSelection] Updated state');
      
      // Remove from global cart
      try {
        removeItem(selectionId);
        console.log(`[HomeScreen][removeSelection] Removed from global cart`);
        } catch (error) {
        console.error('[HomeScreen][removeSelection] Error removing from global cart:', error);
        }
      
      // Force UI refresh
      setTimeout(() => {
        setWeeklyPlan(prevPlan => [...JSON.parse(JSON.stringify(updatedWeeklyPlan))]);
      }, 100);
      
      // UI feedback
      // Alert.alert("Bilgi", "Ürün planınızdan kaldırıldı");
      
      } catch (error) {
      console.error('[HomeScreen][removeSelection] Error:', error);
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

  // View restaurant details - enhanced to handle both daily and weekly modes
  const viewRestaurantDetails = async (restaurantId: string) => {
    console.log('Viewing restaurant details for:', restaurantId, 'Mode:', orderType);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      try {
        // Always try to fetch menu from subcollection first
        let menuItems = await getRestaurantMenu(restaurantId);
        console.log('Menu items from subcollection:', menuItems);
        
        // If subcollection is empty, try to get from restaurant document
        if (!menuItems || menuItems.length === 0) {
          console.log('Trying to get menu from restaurant document...');
          const restaurantDoc = await getRestaurantById(restaurantId);
          
          if (restaurantDoc) {
            // Check different possible menu fields
            if (restaurantDoc.menu && Array.isArray(restaurantDoc.menu)) {
              menuItems = restaurantDoc.menu;
              console.log('Menu items from restaurant.menu:', menuItems);
            } else if ((restaurantDoc as any).menuItems && Array.isArray((restaurantDoc as any).menuItems)) {
              menuItems = (restaurantDoc as any).menuItems;
              console.log('Menu items from restaurant.menuItems:', menuItems);
            } else if ((restaurantDoc as any).items && Array.isArray((restaurantDoc as any).items)) {
              menuItems = (restaurantDoc as any).items;
              console.log('Menu items from restaurant.items:', menuItems);
            }
          }
        }
        
        // Fallback to existing restaurant data
        if (!menuItems || menuItems.length === 0) {
          console.log('Using fallback menu data from restaurants state...');
          menuItems = (restaurant as any).items || (restaurant as any).menuItems || (restaurant as any).menu || [];
        }
        
        console.log('Final menu items:', menuItems);
        
        // Restoran verilerine menü ürünlerini ekleyelim
        const restaurantWithMenu = {
          ...restaurant,
          items: menuItems
        } as PlanRestaurant;
        
        setShowRestaurantDetail({
          restaurant: restaurantWithMenu,
          activeTab: 'menu'
        });
      } catch (error) {
        console.error('Error fetching restaurant menu:', error);
        // Hata durumunda mevcut restaurant verilerini kullan
        setShowRestaurantDetail({
          restaurant: {
            ...restaurant,
            items: (restaurant as any).items || (restaurant as any).menuItems || (restaurant as any).menu || []
          } as PlanRestaurant,
          activeTab: 'menu'
        });
      }
    }
  };

  // Handle restaurant detail tab change
  const handleRestaurantTabChange = (tab: 'menu' | 'reviews' | 'info') => {
    if (showRestaurantDetail) {
      setShowRestaurantDetail({
        ...showRestaurantDetail,
        activeTab: tab
      });
    }
  };

  // Handle back to restaurant list
  const handleBackToRestaurantList = () => {
    setShowRestaurantDetail(null);
  };

  // Go to cart
  const goToCart = async () => {
    console.log('[HomeScreen][goToCart] STARTED');
    
    try {
      const itemCount = getCurrentCartItemCount();
      console.log(`[HomeScreen][goToCart] Current cart has ${itemCount} items`);
      
      if (itemCount > 0) {
        console.log('[HomeScreen][goToCart] Adding items to plan before navigating');
        const success = await addCartToSelection();
        
        if (!success) {
          console.error('[HomeScreen][goToCart] Failed to add items to plan');
          Alert.alert(
            "Uyarı",
            "Sepetteki ürünler eklenirken bir sorun oluştu.",
            [{ text: "Tamam", onPress: () => {} }]
          );
        }
    }
    
    // Make sure we're using the correct navigation method
      console.log('[HomeScreen][goToCart] Navigating to Cart screen');
      navigation.navigate('Cart');
      
    } catch (error) {
      console.error('[HomeScreen][goToCart] Error:', error);
      
      // Even if there's an error, still navigate to cart
      navigation.navigate('Cart');
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
        <TouchableOpacity 
          style={styles.aiQuestionContainer} 
          activeOpacity={1.0}
          onPress={() => setShowAiChatbot(true)}
        >
          <Image source={aiIcon} style={styles.aiQuestionIcon} />
          <Text style={styles.aiQuestionText}>{t('ai.askQuestion')}</Text>
        </TouchableOpacity>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {showRestaurantSelection ? (
          <RestaurantSelectionView
            restaurants={restaurants as any}
            onClose={closeRestaurantSelection}
            onComplete={completeMealSelection}
            onAddToCart={orderType === "weekly" ? addDirectlyToPlan : addItemToCart}
            onRemoveFromCart={removeItemFromCart}
            onViewRestaurant={viewRestaurantDetails}
            loading={loading}
            selectedDay={selectedDay?.name || ''}
            selectedDate={selectedDay?.date || ''}
            selectedTime={selectedPlan?.time || ''}
            cartItemCount={getCurrentCartItemCount()}
            cartTotal={calculateCartTotal()}
            goToCart={goToCart}
            isWeeklyPlan={orderType === "weekly"}
            getCurrentItemQuantity={getCurrentItemQuantity}
            showRestaurantDetail={showRestaurantDetail ? {
              restaurant: showRestaurantDetail.restaurant,
              activeTab: showRestaurantDetail.activeTab,
              onTabChange: handleRestaurantTabChange,
              onBackToList: handleBackToRestaurantList
            } : undefined}
                          onContinue={async () => {
                console.log('[HomeScreen][onContinue] Continue button pressed');
                
                if (loading) return;
                setLoading(true);
                
                try {
                  const cartItemCount = getCurrentCartItemCount();
                  if (cartItemCount > 0) {
                    const success = await addCartToSelection();
                    if (success) {
                      console.log('[HomeScreen][onContinue] Items added to plan successfully');
                      
                      // Clear the cart and close restaurant selection
                      setShowRestaurantSelection(false);
                      setSelectedPlanInfo(null);
                      
                      Alert.alert(
                        "Başarılı",
                        "Ürünler planınıza eklendi! Daha fazla ürün ekleyebilirsiniz.",
                        [{ text: "Tamam", onPress: () => {} }]
                      );
                    } else {
                      Alert.alert(
                        "Uyarı",
                        "Ürünler eklenirken bir sorun oluştu.",
                        [{ text: "Tamam", onPress: () => {} }]
                      );
                    }
                  } else {
                    // No items, just close
                    setShowRestaurantSelection(false);
                    setSelectedPlanInfo(null);
                  }
                } catch (error) {
                  console.error('[HomeScreen][onContinue] Error:', error);
                  Alert.alert(
                    "Hata",
                    "İşlem sırasında bir hata oluştu.",
                    [{ text: "Tamam", onPress: () => {} }]
                  );
                } finally {
                  setLoading(false);
                }
              }
            }
          />
        ) : showRestaurantDetail ? (
          // Restaurant detail view for daily mode
          <View style={styles.restaurantDetailContainer}>
            <View style={styles.restaurantDetailHeader}>
              <TouchableOpacity style={styles.menuButton} onPress={handleBackToRestaurantList}>
                <Text style={[styles.navArrowText, {color: '#00B2FF'}]}>←</Text>
              </TouchableOpacity>
              
              <View style={[styles.dayHeader, {flexDirection: 'column', alignItems: 'flex-start'}]}>
                <Text style={[styles.dayTitle, {color: '#333'}]} numberOfLines={1}>
                  {showRestaurantDetail.restaurant.name || showRestaurantDetail.restaurant.isim}
                </Text>
                <Text style={[styles.headerSubtitle, {color: '#00B2FF', marginTop: 5}]} numberOfLines={1}>
                  {showRestaurantDetail.restaurant.category || showRestaurantDetail.restaurant.kategori}
                </Text>
              </View>
            </View>

            {/* Restoran Tabs */}
            <View style={styles.restaurantTabs}>
              <TouchableOpacity 
                style={[styles.restaurantTab, showRestaurantDetail.activeTab === 'menu' && styles.activeTab]}
                onPress={() => handleRestaurantTabChange('menu')}
              >
                <Text style={[styles.restaurantTabText, showRestaurantDetail.activeTab === 'menu' && styles.activeTabText]}>
                  Menü
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.restaurantTab, showRestaurantDetail.activeTab === 'reviews' && styles.activeTab]}
                onPress={() => handleRestaurantTabChange('reviews')}
              >
                <Text style={[styles.restaurantTabText, showRestaurantDetail.activeTab === 'reviews' && styles.activeTabText]}>
                  Yorumlar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.restaurantTab, showRestaurantDetail.activeTab === 'info' && styles.activeTab]}
                onPress={() => handleRestaurantTabChange('info')}
              >
                <Text style={[styles.restaurantTabText, showRestaurantDetail.activeTab === 'info' && styles.activeTabText]}>
                  Bilgiler
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {showRestaurantDetail.activeTab === 'menu' && (
                <ScrollView style={styles.menuTabContent}>
                  {(showRestaurantDetail.restaurant.items || []).length > 0 ? (
                    (showRestaurantDetail.restaurant.items || []).map((item: any) => (
                      <View key={item.id} style={styles.menuItem}>
                        <View style={styles.menuItemLeftSection}>
                          <Text style={styles.menuItemName}>{item.name || item.isim}</Text>
                          <Text style={styles.menuItemPrice}>
                            ₺{(item.price || item.fiyat || 0).toFixed ? (item.price || item.fiyat).toFixed(2) : (item.price || item.fiyat)}
                          </Text>
                        </View>
                        <View style={styles.addToCartRow}>
                          <View style={styles.quantityControlsContainer}>
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => {
                                if (orderType === "weekly" && selectedPlanInfo) {
                                  const { dayIndex, planId } = selectedPlanInfo;
                                  const selection = weeklyPlan[dayIndex]?.plans
                                    .find(p => p.id === planId)?.selections
                                    .find(s => s.id.includes(item.id));
                                  if (selection) {
                                    updateSelectionQuantity(planId, selection.id, -1);
                                  }
                                } else {
                                  // For daily mode, find and remove one item from cart
                                  const cartItem = items.find(cartItem => 
                                    cartItem.id.includes(item.id) || cartItem.name === (item.name || item.isim)
                                  );
                                  if (cartItem) {
                                    removeItem(cartItem.id);
                                  }
                                }
                              }}
                            >
                              <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            
                            <View style={styles.quantityTextContainer}>
                              <Text style={styles.quantityText}>{getCurrentItemQuantity(item.id) || 0}</Text>
                            </View>
                            
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => {
                                if (orderType === "weekly") {
                                  addDirectlyToPlan(showRestaurantDetail.restaurant.id, item.id);
                                } else {
                                  // For daily mode, add to regular cart
                                  const itemPrice = typeof item.fiyat === 'number' ? item.fiyat : 
                                    (typeof item.fiyat === 'string' && !isNaN(parseFloat(item.fiyat))) ? parseFloat(item.fiyat) :
                                    typeof item.price === 'number' ? item.price :
                                    (typeof item.price === 'string' && !isNaN(parseFloat(item.price))) ? parseFloat(item.price) : 0;
                                  
                                  addItem({
                                    id: `daily-${item.id}-${Date.now()}`,
                                    name: item.name || item.isim,
                                    price: itemPrice,
                                    restaurantId: showRestaurantDetail.restaurant.id,
                                    restaurantName: showRestaurantDetail.restaurant.name || showRestaurantDetail.restaurant.isim
                                  });
                                }
                              }}
                            >
                              <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noMenuContainer}>
                      <Text style={styles.noMenuText}>Bu restoran için menü bilgisi bulunmamaktadır.</Text>
                    </View>
                  )}
                </ScrollView>
              )}

              {showRestaurantDetail.activeTab === 'reviews' && (
                <View style={styles.reviewsTab}>
                  <Text style={styles.tabPlaceholder}>Yorumlar yakında...</Text>
                </View>
              )}

              {showRestaurantDetail.activeTab === 'info' && (
                <View style={styles.infoTab}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Adres:</Text>
                    <Text style={styles.infoValue}>
                      {showRestaurantDetail.restaurant.address || showRestaurantDetail.restaurant.adres || 'Bilgi yok'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Çalışma Saatleri:</Text>
                    <Text style={styles.infoValue}>
                      {showRestaurantDetail.restaurant.calismaSaatleri || showRestaurantDetail.restaurant.calismaSaatleri1 || '12:00 - 22:00'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Puan:</Text>
                    <Text style={styles.infoValue}>
                      ★ {showRestaurantDetail.restaurant.rating || showRestaurantDetail.restaurant.puan || '4.5'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Floating Action Button for Daily Mode */}
            {cartItemsCount > 0 && (
              <View style={styles.floatingButtonsContainer}>
                <TouchableOpacity style={styles.cartFloatingButton} onPress={goToCart}>
                  <Text style={styles.cartBtnLabel}>
                    Sepete Git ({cartItemsCount}) 
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
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
                    // Weekly plan is now integrated directly in HomeScreen
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

            {orderType === "weekly" ? (
              // Weekly Plan Content
              <View style={styles.weeklyPlanContainer}>
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
                        <Text style={styles.dayName}>
                          {day.name.substring(0, 3)}
                        </Text>
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
                          {plan.selections && Array.isArray(plan.selections) && plan.selections.length > 0 ? (
                            <>
                              <Text style={styles.selectionTitle}>Seçilen Yemekler:</Text>
                              {plan.selections.map((selection, index) => {
                                // Enhanced validation with more logging
                                if (!selection) {
                                  console.error(`[HomeScreen] Null selection at index ${index} in plan ${plan.id}`);
                                  return null;
                                }
                                
                                if (!selection.id) {
                                  console.error(`[HomeScreen] Selection missing ID at index ${index} in plan ${plan.id}:`, selection);
                                  return null;
                                }
                                
                                console.log(`[HomeScreen] Rendering selection ${index}: ${selection.itemName} from ${selection.restaurantName}`);
                                
                                return (
                                  <View key={`${selection.id}-${index}-${plan.id}`} style={styles.mealSelection}>
                                                                          <View style={styles.mealThumbnail}>
                                <Image 
                                        source={{ uri: selection.restaurantImage || 'https://via.placeholder.com/40' }} 
                                        style={styles.mealThumbnailImage} 
                                />
                                    </View>
                                <View style={styles.mealInfo}>
                                      <Text style={styles.mealName} numberOfLines={1}>
                                        {selection.itemName || 'Yemek'}
                                      </Text>
                                      <Text style={styles.mealRestaurant} numberOfLines={1}>
                                        {selection.restaurantName || 'Restoran'}
                                      </Text>
                                </View>
                                    <View style={styles.quantityAndPrice}>
                                      <Text style={styles.mealPrice}>
                                        {typeof selection.price === 'string' ? selection.price : `₺${selection.price || '0.00'}`}
                                      </Text>
                                      <View style={styles.quantityControls}>
                                <TouchableOpacity 
                                          style={styles.quantityButton}
                                          onPress={() => updateSelectionQuantity(plan.id, selection.id, -1)}
                                >
                                          <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                        <Text style={styles.quantityText}>{selection.quantity || 1}</Text>
                            <TouchableOpacity 
                                          style={styles.quantityButton}
                                          onPress={() => updateSelectionQuantity(plan.id, selection.id, 1)}
                            >
                                          <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                                      </View>
                                    </View>
                                  </View>
                                );
                              })}
                          
                            <TouchableOpacity 
                              style={styles.addMoreButton}
                              onPress={() => openRestaurantSelection(plan.id)}
                            >
                              <Text style={styles.addMoreButtonText}>+ Daha Fazla Yemek Ekle</Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <TouchableOpacity 
                              style={styles.addMealButton}
                              onPress={() => openRestaurantSelection(plan.id)}
                            >
                              <Text style={styles.addMealButtonText}>+ Yemek Ekle</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Footer with Total */}
                <View style={styles.footer}>
                  <TouchableOpacity 
                    style={[styles.checkoutButton, {width: '100%'}]} 
                    onPress={() => navigation.navigate('Cart')}
                  >
                    <Text style={styles.checkoutButtonText}>Siparişi Tamamla</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                        onPress={() => viewRestaurantDetails(restaurant.id)}
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
                          
                          {/* Rating and Delivery Info */}
                          <View style={styles.restaurantMetaRow}>
                            <View style={styles.restaurantRating}>
                              <Text style={styles.star}>★</Text>
                              <Text style={styles.ratingText}>
                                {restaurant.calculatedRating || restaurant.puan || '4.5'}
                              </Text>
                              <Text style={styles.ratingCount}>
                                ({restaurant.reviewCount || '0'})
                              </Text>
                            </View>
                            
                            <View style={styles.deliveryInfo}>
                              <Text style={styles.deliveryTime}>
                                {restaurant.formattedTimeRange || restaurant.teslimatSuresi || '25-40 dk'}
                              </Text>
                              <Text style={styles.deliveryFee}>Ücretsiz</Text>
                            </View>
                          </View>
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
        )}
      </View>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab="Home" t={t} />

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

      {/* AI Chatbot Modal */}
      <AiChefBot
        visible={showAiChatbot}
        restaurants={restaurants}
        onClose={() => setShowAiChatbot(false)}
        onAddToCart={handleAiAddToCart}
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
  restaurantMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  restaurantRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#FFD700',
    fontSize: 14,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: '#777',
  },
  deliveryInfo: {
    alignItems: 'flex-end',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#00B2FF',
    fontWeight: '600',
  },
  deliveryFee: {
    fontSize: 11,
    color: '#4CAF50',
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 100 : 80,
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
    fontSize: 22,
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mealThumbnailImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  selectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    marginTop: 5,
    textAlign: 'left',
    width: '100%',
    paddingLeft: 5,
  },
  // Restaurant Detail Styles
  restaurantDetailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  restaurantDetailHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    opacity: 0.9,
  },
  restaurantTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  restaurantTab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00B2FF',
    borderBottomWidth: 3,
  },
  restaurantTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#00B2FF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  menuTabContent: {
    flex: 1,
    padding: 15,
  },
  menuItem: {
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#00B2FF',
    fontWeight: '500',
  },
  addItemBtn: {
    backgroundColor: '#00B2FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addItemBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noMenuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noMenuText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  reviewsTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  infoTab: {
    flex: 1,
    padding: 20,
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  tabPlaceholder: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cartFloatingButton: {
    backgroundColor: '#00B2FF',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cartBtnLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Quantity control styles
  quantityAndPrice: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  // Menu item layout styles
  menuItemLeftSection: {
    flex: 1,
    marginBottom: 5,
  },
  menuItemPriceRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryContainer: {
    marginTop: 4,
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 3,
    justifyContent: 'space-between',
  },
  quantityTextContainer: {
    minWidth: 30,
    alignItems: 'center',
  },
  addToCartRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  menuItemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuItemQuantitySection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  weeklyPlanContainer: {
    flex: 1,
  },
});