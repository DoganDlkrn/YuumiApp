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
  ActivityIndicator
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

export default function HomeScreen() {
  // useNavigation düzeltildi
  const navigation = useNavigation() as HomeScreenNavProp;
  const [orderType, setOrderType] = useState<"weekly" | "daily">("weekly");
  const [searchText, setSearchText] = useState("");
  const { t, language } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { getItemsCount } = useCart();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const { selectedAddress, addresses, currentLocation } = useLocation();

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
        <ScrollView style={styles.contentContainer} bounces={true} showsVerticalScrollIndicator={false}>
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
                onPress={() => setOrderType("weekly")}
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
                ]}>{t('toggle.weekly')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  styles.rightToggleOption,
                  orderType === "daily" && styles.activeToggle
                ]}
                activeOpacity={1.0}
                onPress={() => setOrderType("daily")}
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
                ]}>{t('toggle.daily')}</Text>
              </TouchableOpacity>
            </View>
          </View>

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
});