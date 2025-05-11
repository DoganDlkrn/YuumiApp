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
  SafeAreaView,
  Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { RootStackParamList } from "../navigation/AppNavigation";
import { useTheme } from "../context/ThemeContext";
import { db } from "../config/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import TouchableWithoutFeedback from "../components/TouchableWithoutFeedback";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

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
  const [activeCategory, setActiveCategory] = useState<string>("Tümü");
  
  const navigation = useNavigation() as MenuSelectionScreenNavProp;
  const { theme } = useTheme();
  const styles = theme === "dark" ? darkStyles : lightStyles;
  const { addItem } = useCart();
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

  const toggleMeal = (mealId: string) => {
    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter((id) => id !== mealId));
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
    }
  };

  // Kategoriye göre menüyü filtreleme
  const filteredMenuItems = activeCategory === "Tümü" 
    ? menuItems 
    : menuItems.filter(item => item.description?.includes(activeCategory));

  const handleAddToCart = () => {
    if (selectedMeals.length === 0) {
      return;
    }
    
    // Add each selected meal to the cart
    selectedMeals.forEach(mealId => {
      const meal = menuItems.find(item => item.id === mealId);
      if (meal) {
        addItem({
          id: meal.id,
          name: meal.name,
          price: meal.price,
          restaurantId: restaurant?.id || '',
          restaurantName: restaurant?.isim || ''
        });
      }
    });
    
    // Clear selection
    setSelectedMeals([]);
    
    // Show success message
    Alert.alert(
      t('cart.added'),
      selectedMeals.length + ' ' + t('cart.items'),
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#1e88e5" : "#64B5F6"} />
        <Text style={[styles.textMessage, { marginTop: 10 }]}>Menü yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
          activeOpacity={1.0}
        >
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!restaurant || menuItems.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.textMessage}>Bu restoranda menü bulunmamaktadır.</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
          activeOpacity={1.0}
        >
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <TouchableWithoutFeedback
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={1.0}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableWithoutFeedback>
          <Text style={styles.headerTitle}>
            {restaurant?.isim || "Restoran Menüsü"}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfoContainer}>
          <View style={styles.restaurantImageContainer}>
            {restaurant?.logoUrl ? (
              <Image 
                source={{ uri: restaurant.logoUrl }} 
                style={styles.restaurantLogo} 
              />
            ) : (
              <View style={styles.restaurantImageFallback}>
                <Text style={styles.restaurantImageFallbackText}>
                  {restaurant?.isim.charAt(0) || "R"}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantCategory}>{restaurant?.kategori}</Text>
            <Text style={styles.restaurantAddress}>{restaurant?.adres}</Text>
            {restaurant?.calismaOaatleri && (
              <Text style={styles.restaurantHours}>
                Çalışma Saatleri: {restaurant.calismaOaatleri}
              </Text>
            )}
          </View>
        </View>
      
        {/* Menu Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              activeCategory === "Tümü" && styles.activeCategoryButton
            ]}
            onPress={() => setActiveCategory("Tümü")}
            activeOpacity={1.0}
          >
            <Text
              style={[
                styles.categoryButtonText,
                activeCategory === "Tümü" && styles.activeCategoryButtonText
              ]}
            >
              Tümü
            </Text>
          </TouchableOpacity>
          
          {/* Benzersiz kategorileri bul */}
          {Array.from(new Set(menuItems.map(item => item.description))).filter(Boolean).map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                activeCategory === category && styles.activeCategoryButton
              ]}
              onPress={() => setActiveCategory(category || "Tümü")}
              activeOpacity={1.0}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  activeCategory === category && styles.activeCategoryButtonText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Menu Items */}
        <FlatList
          data={filteredMenuItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menuListContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.menuItem,
                selectedMeals.includes(item.id) && styles.selectedMenuItem,
              ]}
              onPress={() => toggleMeal(item.id)}
              activeOpacity={1.0}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                ) : null}
                <Text style={styles.menuItemPrice}>{item.price} ₺</Text>
              </View>
              {selectedMeals.includes(item.id) && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
        
        {/* Sepete Ekle Butonu */}
        {selectedMeals.length > 0 && (
          <View style={styles.addToCartContainer}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={1.0}
            >
              <Text style={styles.addToCartButtonText}>
                {selectedMeals.length} ürün seçildi - Sepete Ekle
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#00B2FF',
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerSection: {
    backgroundColor: '#00B2FF',
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#fff",
  },
  placeholder: {
    width: 24,
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  restaurantImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  restaurantLogo: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
  },
  restaurantImageFallback: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B2FF',
  },
  restaurantImageFallbackText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantCategory: {
    fontSize: 14,
    color: "#00B2FF",
    fontWeight: "600",
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  restaurantHours: {
    fontSize: 13,
    color: "#666",
  },
  categoriesScrollView: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  activeCategoryButton: {
    backgroundColor: "#00B2FF",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  activeCategoryButtonText: {
    color: "#fff",
  },
  menuListContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMenuItem: {
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#00B2FF",
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00B2FF",
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#00B2FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addToCartContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addToCartButton: {
    backgroundColor: "#00B2FF",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
});

const darkStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e88e5',
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerSection: {
    backgroundColor: '#1e88e5',
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#fff",
  },
  placeholder: {
    width: 24,
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: "#1e1e1e",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  restaurantImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  restaurantLogo: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
  },
  restaurantImageFallback: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e88e5',
  },
  restaurantImageFallbackText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantCategory: {
    fontSize: 14,
    color: "#4fc3f7",
    fontWeight: "600",
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 4,
  },
  restaurantHours: {
    fontSize: 13,
    color: "#bbb",
  },
  categoriesScrollView: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  activeCategoryButton: {
    backgroundColor: "#1e88e5",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#ddd",
    fontWeight: "500",
  },
  activeCategoryButtonText: {
    color: "#fff",
  },
  menuListContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMenuItem: {
    backgroundColor: "#0d47a1",
    borderWidth: 1,
    borderColor: "#1976d2",
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4fc3f7",
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1e88e5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addToCartContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  addToCartButton: {
    backgroundColor: "#1e88e5",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#1e88e5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  textMessage: {
    fontSize: 16,
    color: "#bbb",
    textAlign: "center",
    marginHorizontal: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: "#e57373",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
});