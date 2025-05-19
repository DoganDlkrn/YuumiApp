import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  HomeScreen,
  MenuSelectionScreen,
  OrderSummaryScreen,
  PaymentScreen,
  LoginScreen,
  SearchScreen,
  OrdersScreen,
  ProfileScreen,
  EditProfileScreen,
  LanguageScreen,
  NotificationSettingsScreen,
  CartScreen,
  AddressesScreen,
  AddressScreen,
  MapScreen,
  WeeklyPlanScreen
} from "../screens";
import { useLanguage } from "../context/LanguageContext";
import { Address } from "../context/LocationContext";

export interface Meal {
  id: string;
  name: string;
  price: number;
}

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Search: { categoryFilter?: string };
  Orders: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Language: undefined;
  NotificationSettings: undefined;
  Cart: undefined;
  Addresses: undefined;
  Address: { addressId?: string; address?: Address; location?: { latitude: number; longitude: number; address?: string } };
  Map: { currentLocation?: { latitude?: number; longitude?: number } };
  MenuSelection: { orderType: "weekly" | "daily"; restaurantId?: string };
  OrderSummary: { selectedMeals: string[] };
  Payment: {
    selectedMeals: Meal[];
    planType: "weekly" | "normal";
  };
  WeeklyPlan: undefined;
};

const Stack = createStackNavigator();

const defaultTranslations = {
  'login.title': 'Giriş Yap',
  'tabs.search': 'Arama',
  'tabs.orders': 'Siparişlerim',
  'profile.title': 'Profilim',
  'profile.language': 'Dil Seçenekleri',
  'profile.profileInfo': 'Profil Bilgileri',
  'menu.selection': 'Yemek Seçimi',
  'order.summary': 'Sipariş Özeti',
  'payment.screen': 'Ödeme Ekranı',
  'notifications.settings': 'İletişim Tercihlerim',
  'cart.title': 'Sepetim',
  'addresses.title': 'Adreslerim',
  'address.title': 'Adres Ekle/Düzenle',
  'map.title': 'Haritada Seç'
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
        animationEnabled: true, // Enabling animations to ensure proper context updates
        animationTypeForReplace: 'push',
        presentation: 'card',
        cardStyle: { backgroundColor: 'white' },
        cardOverlayEnabled: false
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
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ 
          title: t('notifications.settings') || 'Bildirim Ayarları',
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ 
          title: t('cart.title'),
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ 
          title: t('addresses.title') || 'Adreslerim',
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Address"
        component={AddressScreen}
        options={{ 
          title: t('address.title') || 'Adres Ekle/Düzenle',
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ 
          title: t('map.title') || 'Haritada Seç',
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="MenuSelection"
        component={MenuSelectionScreen}
        options={{ 
          title: t('menu.selection'),
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummaryScreen}
        options={{ 
          title: t('order.summary'),
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ 
          title: t('payment.screen'),
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="WeeklyPlan"
        component={WeeklyPlanScreen}
        options={{ 
          title: t('toggle.weekly') || 'Weekly Plan',
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}