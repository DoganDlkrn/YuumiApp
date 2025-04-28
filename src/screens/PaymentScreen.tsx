// src/screens/PaymentScreen.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";
// 1) Dark mode için context
import { useTheme } from "../context/ThemeContext";
// Import the loading context
import { useNavigationLoading } from "../navigation/NavigationContainer";

interface Meal {
  id: string;
  name: string;
  price: number;
}

type PaymentRouteProp = {
  params: {
    selectedMeals: Meal[];
    planType: "weekly" | "normal";
  };
};
type PaymentNavProp = StackNavigationProp<RootStackParamList, "Payment">;

export default function PaymentScreen() {
  const route = useRoute() as PaymentRouteProp;
  const navigation = useNavigation() as PaymentNavProp;
  const { setLoading } = useNavigationLoading();

  const { selectedMeals, planType } = route.params;

  // 2) Temayı al
  const { theme } = useTheme();
  // 3) Koşullu style seçimi
  const styles = theme === "dark" ? darkStyles : lightStyles;

  const totalPrice = useMemo(() => {
    let sum = selectedMeals.reduce((acc: number, meal: Meal) => acc + meal.price, 0);
    if (planType === "weekly") {
      sum = sum * 0.9;
    }
    return sum;
  }, [selectedMeals, planType]);

  const handlePayment = () => {
    console.log("Ödeme başlatıldı...");
    console.log("Seçilen plan:", planType);
    console.log("Toplam tutar:", totalPrice.toFixed(2));

    // Show loading overlay
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Ödeme İşlemi", `Ödeme alındı. Tutar: ${totalPrice.toFixed(2)} ₺`);
      // Navigate back to home after successful payment
      navigation.navigate("Home");
    }, 2000);
  };

  const renderMealItem = ({ item }: { item: Meal }) => {
    return (
      <View style={styles.mealItem}>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealPrice}>{item.price} ₺</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ödeme Ekranı</Text>
      <Text style={styles.planInfo}>
        Plan Türü: {planType === "weekly" ? "Haftalık (%10 indirim)" : "Normal"}
      </Text>

      <FlatList<Meal>
        data={selectedMeals}
        keyExtractor={(meal) => meal.id}
        renderItem={renderMealItem}
        style={{ marginVertical: 10 }}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Toplam: {totalPrice.toFixed(2)} ₺
        </Text>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Ödeme Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

// 4) Light ve Dark için ayrı StyleSheet'ler
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  planInfo: {
    fontSize: 16,
    color: "#666",
  },
  mealItem: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    justifyContent: "space-between",
  },
  mealName: {
    fontSize: 18,
    color: "#2c3e50",
  },
  mealPrice: {
    fontSize: 18,
    color: "#2c3e50",
  },
  totalContainer: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  payButton: {
    marginTop: 30,
    backgroundColor: "#64b5f6",
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  planInfo: {
    fontSize: 16,
    color: "#bbb",
  },
  mealItem: {
    flexDirection: "row",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    justifyContent: "space-between",
  },
  mealName: {
    fontSize: 18,
    color: "#fff",
  },
  mealPrice: {
    fontSize: 18,
    color: "#fff",
  },
  totalContainer: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  payButton: {
    marginTop: 30,
    backgroundColor: "#1e88e5",
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});