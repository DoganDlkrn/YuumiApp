import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import MenuSelectionScreen from "../screens/MenuSelectionScreen";
import OrderSummaryScreen from "../screens/OrderSummaryScreen";
import PaymentScreen from "../screens/PaymentScreen";

export interface Meal {
  id: string;
  name: string;
  price: number;
}

export type RootStackParamList = {
  Home: undefined;
  MenuSelection: { orderType: "weekly" | "daily" };
  OrderSummary: { selectedMeals: string[] };
  Payment: {
    selectedMeals: Meal[];
    planType: "weekly" | "normal";
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  // Define colors for light theme
  const backgroundColor = "#E3F2FD";
  const accentColor = "#64b5f6";

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor },
        headerTintColor: accentColor,
        headerTitleStyle: {
          color: accentColor,
          fontWeight: "bold",
        },
        headerBackTitle: "",
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