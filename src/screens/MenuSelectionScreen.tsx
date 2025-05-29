import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { RootStackParamList } from "../navigation/AppNavigation";
import { useTheme } from "../context/ThemeContext";
import { db } from "../config/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import TouchableWithoutFeedback from "../components/TouchableWithoutFeedback";
import { useCart } from "./CartScreen";
import { useLanguage } from "../context/LanguageContext";
import LoadingOverlay from "../components/LoadingOverlay";
import FloatingActionBar from "../components/FloatingActionBar";

type MenuSelectionScreenRouteProp = RouteProp<RootStackParamList, "MenuSelection">;
type MenuSelectionScreenNavProp = StackNavigationProp<RootStackParamList, "MenuSelection">;

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type Restaurant = {
  id: string;
  isim: string;
  kategori: string;
  adres: string;
  calismaOaatleri?: string;
  logoUrl?: string;
  menu: MenuItem[];
};

// Quantity state type for each meal
interface MealQuantities {
  [mealId: string]: number;
}

export default function MenuSelectionScreen() {
  const route = useRoute<MenuSelectionScreenRouteProp>();
  const initialOrderType = route.params?.orderType || "weekly";
  const restaurantId = route.params?.restaurantId;
  
  const [orderType, setOrderType] = useState<"weekly" | "daily">(initialOrderType);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [mealQuantities, setMealQuantities] = useState<MealQuantities>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [showAddedToCartMessage, setShowAddedToCartMessage] = useState(false);
  const [addedToCartInfo, setAddedToCartInfo] = useState<{count: number, totalPrice: number}>({count: 0, totalPrice: 0});
  const [debugMessage, setDebugMessage] = useState<string>('');
  
  const navigation = useNavigation() as MenuSelectionScreenNavProp;
  const { theme } = useTheme();
  const styles = theme === "dark" ? darkStyles : lightStyles;
  const { addItem, addItemWithQuantity, debugCart } = useCart();
  const { t } = useLanguage();

  // Fetch restaurant and menu items from Firebase when component mounts or restaurantId changes
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (!restaurantId) {
        setError("Restoran ID bilgisi eksik");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const restaurantRef = doc(db, "restaurants", restaurantId);
        const restaurantDoc = await getDoc(restaurantRef);
        
        if (!restaurantDoc.exists()) {
          setError("Restoran bulunamadı");
          setLoading(false);
          return;
        }
        
        const restaurantData = restaurantDoc.data();
        
        // Restoran bilgilerini ayarla
        const restaurantObj: Restaurant = {
          id: restaurantDoc.id,
          isim: restaurantData.isim || "İsimsiz Restoran",
          kategori: restaurantData.kategori || "",
          adres: restaurantData.adres || "",
          calismaOaatleri: restaurantData.calismaSaatleri || "",
          logoUrl: restaurantData.logoUrl || "",
          menu: []
        };
        
        // Menü öğelerini dönüştür
        if (restaurantData && Array.isArray(restaurantData.menu)) {
          const items: MenuItem[] = restaurantData.menu.map((item: any, index: number) => ({
            id: item.id || `item_${index}`,
            name: item.isim || "İsimsiz Ürün",
            price: item.fiyat || 0,
            description: item.aciklama || ""
          }));
          
          restaurantObj.menu = items;
          setMenuItems(items);
        } else {
          setError("Bu restoran için menü öğeleri bulunamadı");
        }
        
        setRestaurant(restaurantObj);
      } catch (err) {
        console.error("Menü yüklenirken hata oluştu:", err);
        setError("Menü öğeleri yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [restaurantId]);

  // Filter menu items based on active category
  const filteredMenuItems = activeCategory === ""
    ? menuItems
    : menuItems.filter(item => item.description?.includes(activeCategory));

  // Calculate current selection stats for FloatingActionBar
  const currentSelectionItemCount = Object.values(mealQuantities).reduce((sum, qty) => sum + qty, 0);
  const currentSelectionTotalPrice = Object.keys(mealQuantities).reduce((total, mealId) => {
    const meal = menuItems.find(item => item.id === mealId);
    const quantity = mealQuantities[mealId] || 0;
    if (meal && quantity > 0) {
      return total + (meal.price * quantity);
    }
    return total;
  }, 0);

  // Handle go to cart for daily orders
  const handleGoToCartDaily = () => {
    console.log("Günlük Sipariş - Sepete Git tıklandı");
    if (currentSelectionItemCount > 0) {
      // First add items to cart, then navigate
      handleAddToCart();
      setTimeout(() => {
        navigation.navigate('Cart');
      }, 500); // Small delay to ensure items are added
    } else {
      navigation.navigate('Cart');
    }
  };

  // Increment quantity for a meal
  const incrementQuantity = (mealId: string) => {
    setMealQuantities(prev => ({
      ...prev,
      [mealId]: (prev[mealId] || 0) + 1
    }));
    
    if (!selectedMeals.includes(mealId)) {
      setSelectedMeals([...selectedMeals, mealId]);
    }
  };

  // Decrement quantity for a meal
  const decrementQuantity = (mealId: string) => {
    setMealQuantities(prev => {
      const newQuantities = { ...prev };
      if (newQuantities[mealId] > 0) {
        newQuantities[mealId] -= 1;
      }
      
      // Remove from selected meals if quantity is 0
      if (newQuantities[mealId] === 0) {
        delete newQuantities[mealId];
        setSelectedMeals(selectedMeals.filter(id => id !== mealId));
      }
      
      return newQuantities;
    });
  };

  const handleAddToCart = () => {
    if (selectedMeals.length === 0) {
      return;
    }
    
    let totalCount = 0;
    let totalPrice = 0;
    
    try {
      console.log("Starting to add items to cart");
      
      // Add each selected meal to the cart with its quantity - using the more efficient method
      selectedMeals.forEach(mealId => {
        const meal = menuItems.find(item => item.id === mealId);
        const quantity = mealQuantities[mealId] || 0;
        
        if (meal && quantity > 0) {
          totalCount += quantity;
          totalPrice += meal.price * quantity;
          
          // Use the new direct quantity method instead of loop
          addItemWithQuantity({
            id: meal.id,
            name: meal.name,
            price: meal.price,
            restaurantId: restaurant?.id || '',
            restaurantName: restaurant?.isim || ''
          }, quantity);
        }
      });

      // Log the cart contents for debugging
      console.log("Cart after adding items:");
      debugCart();

      // Update added to cart info for display in the notification bar
      setAddedToCartInfo({
        count: totalCount,
        totalPrice: totalPrice
      });
      
      console.log(`Added ${totalCount} items to cart, total price: ${totalPrice}`);
      
      // Show success message
      setShowAddedToCartMessage(true);
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setShowAddedToCartMessage(false);
      }, 3000);
      
      // Clear selection
      setSelectedMeals([]);
      setMealQuantities({});
    } catch (error) {
      console.error("Error adding items to cart:", error);
      Alert.alert("Hata", "Sepete eklerken bir sorun oluştu. Lütfen tekrar deneyin.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />
        
        {/* Mavi Header Section - ProfileScreen gibi */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={1.0} 
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menü</Text>
          <View style={styles.rightHeaderSpace} />
        </View>
        
        {/* White Content Section with Loading Overlay */}
        <View style={styles.whiteContainer}>
          <View style={styles.loadingContainer}>
            <LoadingOverlay visible={true} message="Menü yükleniyor" transparent={true} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />
        
        {/* Mavi Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={1.0}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menü</Text>
          <View style={styles.rightHeaderSpace} />
        </View>
        
        {/* White Content Section */}
        <View style={styles.whiteContainer}>
          <View style={styles.centerContent}>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.goBack()}
              activeOpacity={1.0}
            >
              <Text style={styles.buttonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant || menuItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />
        
        {/* Mavi Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={1.0}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menü</Text>
          <View style={styles.rightHeaderSpace} />
        </View>
        
        {/* White Content Section */}
        <View style={styles.whiteContainer}>
          <View style={styles.centerContent}>
            <Text style={styles.textMessage}>Bu restoranda menü bulunmamaktadır.</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.goBack()}
              activeOpacity={1.0}
            >
              <Text style={styles.buttonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Mavi Header Section - ProfileScreen gibi */}
      <View style={styles.headerSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={1.0}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {restaurant?.isim || "Menü"}
        </Text>
        <View style={styles.rightHeaderSpace} />
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {/* Restaurant bilgileri - beyaz arka planlı */}
        {restaurant && (
          <View style={styles.restaurantInfoContainer}>
            <Text style={styles.restaurantAddress}>{restaurant.adres}</Text>
            <Text style={styles.restaurantHours}>{restaurant.calismaOaatleri || "Çalışma saatleri belirtilmemiş"}</Text>
          </View>
        )}
        
        {/* Categories */}
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                activeCategory === "" && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory("")}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  activeCategory === "" && styles.activeCategoryButtonText,
                ]}
              >
                Tümü
              </Text>
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  activeCategory === category && styles.activeCategoryButton,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    activeCategory === category && styles.activeCategoryButtonText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        {/* Menu Items */}
        <ScrollView style={styles.menuItemsContainer}>
          {filteredMenuItems.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemPrice}>{item.price} ₺</Text>
              </View>
              
              {/* Quantity Selector */}
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => decrementQuantity(item.id)}
                  disabled={!(mealQuantities[item.id] > 0)}
                >
                  <Text style={[
                    styles.quantityButtonText,
                    !(mealQuantities[item.id] > 0) && styles.disabledButton
                  ]}>-</Text>
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>
                  {mealQuantities[item.id] || 0}
                </Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => incrementQuantity(item.id)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        

      </View>

      {/* FloatingActionBar - Show when items are selected */}
      {currentSelectionItemCount > 0 && (
        <FloatingActionBar
          itemCount={currentSelectionItemCount}
          totalPrice={currentSelectionTotalPrice}
          onGoToCart={handleGoToCartDaily}
          showContinueButton={false}
        />
      )}

      {/* Added to Cart Notification */}
      {showAddedToCartMessage && (
        <View style={styles.addedToCartNotification}>
          <View style={styles.addedToCartContent}>
            <Text style={styles.addedToCartText}>
              {addedToCartInfo.count} ürün sepete eklendi ({addedToCartInfo.totalPrice} ₺)
            </Text>
            <TouchableOpacity
              style={styles.viewCartButton}
              onPress={() => {
                console.log("Navigating to Cart screen");
                navigation.navigate('Cart');
              }}
            >
              <Text style={styles.viewCartButtonText}>Sepete Git</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B2FF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(245, 245, 245, 0.7)',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00B2FF',
    paddingBottom: 15,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  rightHeaderSpace: {
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
  restaurantInfoContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  restaurantHours: {
    fontSize: 14,
    color: '#666',
  },
  categoriesContainer: {
    padding: 8,
    backgroundColor: 'white',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeCategoryButton: {
    backgroundColor: '#00B2FF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuItemsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#00B2FF',
    fontWeight: 'bold',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 25,
    textAlign: 'center',
  },

  textMessage: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginHorizontal: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#00B2FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addedToCartNotification: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  addedToCartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addedToCartText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  viewCartButton: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
  },
  viewCartButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e88e5",
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e88e5',
    paddingBottom: 15,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  rightHeaderSpace: {
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
  restaurantInfoContainer: {
    padding: 16,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 4,
  },
  restaurantHours: {
    fontSize: 14,
    color: '#bbb',
  },
  categoriesContainer: {
    padding: 8,
    backgroundColor: '#1e1e1e',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  activeCategoryButton: {
    backgroundColor: '#1e88e5',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#ddd',
  },
  activeCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuItemsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1e1e1e',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#4fc3f7',
    fontWeight: 'bold',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 25,
    textAlign: 'center',
    color: '#fff',
  },

  textMessage: {
    fontSize: 16,
    color: '#bbb',
    textAlign: "center",
    marginHorizontal: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: '#e57373',
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addedToCartNotification: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#388E3C',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  addedToCartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addedToCartText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  viewCartButton: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
  },
  viewCartButtonText: {
    color: '#388E3C',
    fontSize: 14,
    fontWeight: 'bold',
  },
});