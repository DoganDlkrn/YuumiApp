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
  ImageSourcePropType
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";

// Import images
const menuIcon: ImageSourcePropType = require('../assets/images/menu.png');
const locationIcon: ImageSourcePropType = require('../assets/images/placeholder.png');
const cartIcon: ImageSourcePropType = require('../assets/images/cart.png');
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const aiIcon: ImageSourcePropType = require('../assets/images/robot.png');
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');

// Tür tanımı düzeltildi
type HomeScreenNavProp = StackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  // useNavigation düzeltildi
  const navigation = useNavigation() as HomeScreenNavProp;
  const [orderType, setOrderType] = useState<"weekly" | "daily">("weekly");
  const [searchText, setSearchText] = useState("");

  // Force status bar to be light-content and make it visible on iOS
  useEffect(() => {
    // Ensure status bar is light content (white text)
    StatusBar.setBarStyle("light-content", true);

    // For Android, set the background color
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#00B2FF');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        {/* Top Navigation Bar */}
        <View style={styles.topNavBar}>
          <TouchableOpacity style={styles.menuButton}>
            <Image source={menuIcon} style={styles.menuIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationContainer}>
            <Image source={locationIcon} style={styles.locationIcon} />
            <Text style={styles.locationText}>Konum Seç</Text>
            <Text style={styles.locationArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cartButton}>
            <Image source={cartIcon} style={styles.cartIcon} />
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Image source={searchIcon} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Restoran veya yemek ara..."
              placeholderTextColor="#777"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* AI Question Section */}
        <TouchableOpacity style={styles.aiQuestionContainer}>
          <Image source={aiIcon} style={styles.aiQuestionIcon} />
          <Text style={styles.aiQuestionText}>Yapay zekaya soru sor</Text>
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
                onPress={() => setOrderType("weekly")}
              >
                <View style={styles.iconContainer}>
                  <Text style={[
                    styles.calendarIcon,
                    orderType === "weekly" && styles.activeCalendarIcon
                  ]}>
                    {/* Calendar icon for weekly */}
                    {"\uf073"}
                  </Text>
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
                onPress={() => setOrderType("daily")}
              >
                <View style={styles.iconContainer}>
                  <Text style={[
                    styles.clockIcon,
                    orderType === "daily" && styles.activeClockIcon
                  ]}>
                    {/* Clock icon for daily */}
                    {"\uf017"}
                  </Text>
                </View>
                <Text style={[
                  styles.toggleText,
                  orderType === "daily" && styles.activeToggleText
                ]}>Günlük</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Kategoriler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {['Pizza', 'Burger', 'Kebap', 'Tatlı', 'İçecek', 'Kahvaltı'].map((category, index) => (
                <TouchableOpacity key={index} style={styles.categoryItem}>
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Restaurants */}
          <View style={styles.restaurantsContainer}>
            <Text style={styles.sectionTitle}>Popüler Restoranlar</Text>
            {['Restoran A', 'Restoran B', 'Restoran C'].map((restaurant, index) => (
              <TouchableOpacity
                key={index}
                style={styles.restaurantItem}
                onPress={() => navigation.navigate("MenuSelection", { orderType })}
              >
                <View style={styles.restaurantImagePlaceholder}>
                  <Image source={restaurantIcon} style={styles.restaurantImage} />
                </View>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant}</Text>
                  <Text style={styles.restaurantDescription}>Lezzetli yemekler</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <Image source={restaurantIcon} style={[styles.tabIcon, styles.activeTabIcon]} />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Yemek</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Search')}
        >
          <Image source={searchIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Arama</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Orders')}
        >
          <Image source={orderIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Siparişlerim</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image source={userIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Profilim</Text>
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
    paddingTop: 10,
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
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
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
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  calendarIcon: {
    fontSize: 24,
    color: '#777777',
    fontWeight: 'bold',
  },
  activeCalendarIcon: {
    color: 'white',
  },
  clockIcon: {
    fontSize: 24,
    color: '#777777',
    fontWeight: 'bold',
  },
  activeClockIcon: {
    color: 'white',
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
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  restaurantImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantDescription: {
    fontSize: 14,
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
});