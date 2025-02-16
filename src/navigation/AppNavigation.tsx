import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Image, StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MenuSelectionScreen from "../screens/MenuSelectionScreen";
import OrderSummaryScreen from "../screens/OrderSummaryScreen";
import PaymentScreen from "../screens/PaymentScreen";

// require ile yerel ikon
const arrowIcon = require("../assets/arrow.png");

export interface Meal {
  id: string;
  name: string;
  price: number;
}

export type RootStackParamList = {
  Home: undefined;
  MenuSelection: undefined;
  OrderSummary: { selectedMeals: string[] };
  Payment: {
    selectedMeals: Meal[];
    planType: "weekly" | "normal";
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const backgroundColor = "#E3F2FD";   // Uygulamanın arka planı + header arka plan
  const accentColor = "#64b5f6";       // Geri ikonunun ve butonların rengi

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor },
        headerTintColor: accentColor,
        headerTitleStyle: {
          color: accentColor,
          fontWeight: "bold",
        },
        headerBackTitle: "",
        headerBackImage: () => (
          <Image
            source={arrowIcon}
            style={[styles.arrow, { tintColor: accentColor }]}
            resizeMode="contain"
          />
        ),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "SmartMeal" }}
      />
      <Stack.Screen
        name="MenuSelection"
        component={MenuSelectionScreen}
        options={{ title: "Yemek Seçimi" }}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummaryScreen}
        options={{ title: "Sipariş Özeti" }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: "Ödeme Ekranı" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  arrow: {
    width: 24,
    height: 24,
    marginLeft: 15,
  },
});