import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { RootStackParamList } from "../navigation/AppNavigation";
import ToggleTabs from "../components/ToggleTabs";
import { useTheme } from "../context/ThemeContext";
import { db } from "../config/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

type MenuSelectionScreenRouteProp = RouteProp<RootStackParamList, "MenuSelection">;
type MenuSelectionScreenNavProp = StackNavigationProp<RootStackParamList, "MenuSelection">;

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
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
  
  const navigation = useNavigation() as MenuSelectionScreenNavProp;
  const { theme } = useTheme();
  const styles = theme === "dark" ? darkStyles : lightStyles;

  // Fetch menu items from Firebase when component mounts or restaurantId changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        setError("Restaurant ID is missing");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const restaurantRef = doc(db, "restaurants", restaurantId);
        const restaurantDoc = await getDoc(restaurantRef);
        
        if (!restaurantDoc.exists()) {
          setError("Restaurant not found");
          setLoading(false);
          return;
        }
        
        // Assuming menu is an array in the restaurant document
        const restaurantData = restaurantDoc.data();
        
        if (restaurantData && Array.isArray(restaurantData.menu)) {
          const items: MenuItem[] = restaurantData.menu.map((item: any, index: number) => ({
            id: item.id || `item_${index}`,
            name: item.isim || item.name || "Unnamed Item",
            price: item.fiyat || item.price || 0,
            description: item.aciklama || item.description || ""
          }));
          
          setMenuItems(items);
        } else {
          setError("No menu items found for this restaurant");
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurantId]);

  const toggleMeal = (mealId: string) => {
    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter((id) => id !== mealId));
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
    }
  };

  const handleToggleOrderType = (type: "weekly" | "daily") => {
    setOrderType(type);
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
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (menuItems.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.textMessage}>Bu restoranda menü bulunmamaktadır.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ToggleTabs activeTab={orderType} onToggle={handleToggleOrderType} />
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.mealItem,
              selectedMeals.includes(item.id) && styles.selectedMealItem,
            ]}
            onPress={() => toggleMeal(item.id)}
            activeOpacity={1.0}
          >
            <Text style={styles.mealText}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.mealDescription}>{item.description}</Text>
            ) : null}
            <Text style={styles.mealPrice}>{item.price} ₺</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={[styles.button, selectedMeals.length === 0 && styles.disabledButton]}
        onPress={() => selectedMeals.length > 0 && navigation.navigate("OrderSummary", { selectedMeals })}
        disabled={selectedMeals.length === 0}
        activeOpacity={1.0}
      >
        <Text style={styles.buttonText}>Devam Et</Text>
      </TouchableOpacity>
    </View>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    padding: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  mealItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  selectedMealItem: {
    backgroundColor: "#bbdefb",
    borderColor: "#64b5f6",
    borderWidth: 1,
  },
  mealText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  mealDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
  },
  mealPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2980b9",
    marginTop: 8,
    alignSelf: "flex-end",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#64B5F6",
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: "#B0BEC5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  textMessage: {
    fontSize: 16,
    color: "#7f8c8d",
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
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  mealItem: {
    backgroundColor: "#212121",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedMealItem: {
    backgroundColor: "#1565c0",
    borderColor: "#1976d2",
    borderWidth: 1,
  },
  mealText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  mealDescription: {
    fontSize: 14,
    color: "#bdc3c7",
    marginTop: 5,
  },
  mealPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4fc3f7",
    marginTop: 8,
    alignSelf: "flex-end",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#1e88e5",
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: "#455A64",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  textMessage: {
    fontSize: 16,
    color: "#bdc3c7",
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