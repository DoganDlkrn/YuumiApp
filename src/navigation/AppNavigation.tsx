import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import MenuSelectionScreen from "../screens/MenuSelectionScreen";
import OrderSummaryScreen from "../screens/OrderSummaryScreen";
import PaymentScreen from "../screens/PaymentScreen";
import LoginScreen from "../screens/LoginScreen";
import SearchScreen from "../screens/SearchScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import LanguageScreen from "../screens/LanguageScreen";
import { useLanguage } from "../context/LanguageContext";

export interface Meal {
  id: string;
  name: string;
  price: number;
}

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Search: undefined;
  Orders: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Language: undefined;
  MenuSelection: { orderType: "weekly" | "daily" };
  OrderSummary: { selectedMeals: string[] };
  Payment: {
    selectedMeals: Meal[];
    planType: "weekly" | "normal";
  };
};

const Stack = createStackNavigator();

const defaultTranslations = {
  'login.title': 'Giriş Yap',
  'tabs.search': 'Arama',
  'tabs.orders': 'Siparişlerim',
  'profile.title': 'Profilim',
  'profile.language': 'Dil Seçenekleri',
  'profile.profileInfo': 'Profil Bilgileri'
};

export default function AppNavigator() {
  // Define theme colors
  const primaryBlue = "#00B2FF";
  const headerTextColor = "white";
  
  // Safely get the translation function with a fallback
  let t: (key: string) => string;
  
  try {
    // Use the language context if available
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch (error) {
    // Fallback function if context is not available
    console.warn("Language context not available, using fallbacks:", error);
    t = (key: string) => defaultTranslations[key as keyof typeof defaultTranslations] || key;
  }

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        headerStyle: { 
          backgroundColor: primaryBlue,
          elevation: 0, // Android
          shadowOpacity: 0, // iOS
        },
        headerTintColor: headerTextColor,
        headerTitleStyle: {
          color: headerTextColor,
          fontWeight: "bold",
        },
        headerBackTitle: "",
        animationEnabled: false,
        presentation: 'card',
        cardStyle: { backgroundColor: 'white' },
        cardOverlayEnabled: false,
        detachPreviousScreen: false,
        freezeOnBlur: true,
        gestureEnabled: false,
        animationTypeForReplace: 'pop',
        cardStyleInterpolator: () => ({
          cardStyle: {
            opacity: 1,
            transform: [{ translateX: 0 }, { translateY: 0 }]
          },
          overlayStyle: {
            opacity: 0
          }
        })
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ 
          title: t('login.title'),
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ 
          title: "SmartMeal",
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ 
          title: t('tabs.search'),
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ 
          title: t('tabs.orders'),
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ 
          title: t('profile.title'),
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ 
          title: t('profile.profileInfo'),
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ 
          title: t('profile.language'),
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="MenuSelection"
        component={MenuSelectionScreen}
        options={{ 
          title: "Yemek Seçimi",
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummaryScreen}
        options={{ 
          title: "Sipariş Özeti",
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ 
          title: "Ödeme Ekranı",
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}