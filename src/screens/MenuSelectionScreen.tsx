import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";

// 1) useTheme'i import et
import { useTheme } from "../context/ThemeContext";

type MenuSelectionScreenNavProp = StackNavigationProp<
  RootStackParamList,
  "MenuSelection"
>;

const dummyMeals = [
  { id: "1", name: "Tavuk Izgara" },
  { id: "2", name: "Sebzeli Makarna" },
  { id: "3", name: "Köfte & Pilav" },
];

export default function MenuSelectionScreen() {
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const navigation = useNavigation() as MenuSelectionScreenNavProp;
  
  // 2) Tema context'inden theme değerini al
  const { theme } = useTheme();

  // 3) Koşullu stil seçimi
  const styles = theme === "dark" ? darkStyles : lightStyles;

  const toggleMeal = (mealId: string) => {
    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter((id) => id !== mealId));
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Haftalık Yemek Seçimi</Text>
      <FlatList
        data={dummyMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.mealItem,
              selectedMeals.includes(item.id) && styles.selectedMealItem,
            ]}
            onPress={() => toggleMeal(item.id)}
          >
            <Text style={styles.mealText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("OrderSummary", { selectedMeals })
        }
      >
        <Text style={styles.buttonText}>Devam Et</Text>
      </TouchableOpacity>
    </View>
  );
}

// 4) Light ve Dark için iki ayrı StyleSheet

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  mealItem: {
    backgroundColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedMealItem: {
    backgroundColor: "#64b5f6",
  },
  mealText: {
    fontSize: 18,
    color: "#2c3e50",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#64B5F6",
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  buttonText: {
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
    marginBottom: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  mealItem: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedMealItem: {
    backgroundColor: "#1e88e5",
  },
  mealText: {
    fontSize: 18,
    color: "#fff",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#1e88e5",
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});