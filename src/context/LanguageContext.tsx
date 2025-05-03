import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add a helper function to safely use AsyncStorage
const safeAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage.getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('AsyncStorage.setItem error:', error);
      return false;
    }
  }
};

// Available languages
export type LanguageCode = 'tr' | 'en';

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' }
];

// Translations organized by language code
const translations: Record<LanguageCode, Record<string, string>> = {
  tr: {
    // Common
    'app.name': 'Yuumi',
    'loading': 'Yükleniyor',
    'cancel': 'İptal',
    'anonymous': 'İsimsiz Kullanıcı',
    'no.email': 'E-posta yok',
    'no.phone': 'Telefon yok',
    'logout.title': 'Çıkış Yap',
    'logout.confirm': 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',

    // Auth screens
    'login.title': 'Giriş Yap',
    'login.email': 'E-posta',
    'login.password': 'Şifre',
    'login.button': 'Giriş Yap',
    'login.register': 'Hesabınız yok mu? Kayıt olun',
    'login.forgot': 'Şifremi Unuttum',

    'register.title': 'Hesap Oluştur',
    'register.name': 'Adınız Soyadınız',
    'register.email': 'E-posta',
    'register.phone': 'Telefon',
    'register.password': 'Şifre',
    'register.confirmPassword': 'Şifre Tekrar',
    'register.button': 'Kayıt Ol',
    'register.login': 'Zaten hesabınız var mı? Giriş yapın',

    // Profile screen
    'profile.title': 'Profilim',
    'profile.account': 'Hesap',
    'profile.preferences': 'Tercihler',
    'profile.other': 'Diğer',
    'profile.profileInfo': 'Profil Bilgileri',
    'profile.addresses': 'Adreslerim',
    'profile.paymentMethods': 'Ödeme Yöntemlerim',
    'profile.notifications': 'Bildirim Ayarları',
    'profile.language': 'Dil Seçenekleri',
    'profile.support': 'Yardım & Destek',
    'profile.logout': 'Çıkış Yap',
    
    // Edit Profile Screen
    'profile.personalInfo': 'Kişisel Bilgiler',
    'profile.firstName': 'Ad',
    'profile.lastName': 'Soyad',
    'profile.email': 'E-posta',
    'profile.phone': 'Telefon Numarası',
    'profile.enterFirstName': 'Adınızı giriniz',
    'profile.enterLastName': 'Soyadınızı giriniz',
    'profile.enterPhone': 'Telefon numaranızı giriniz',
    'profile.cantChangeEmail': 'E-posta adresiniz değiştirilemez',
    'profile.saveChanges': 'Değişiklikleri Kaydet',

    // Bottom tabs
    'tabs.food': 'Yemek',
    'tabs.search': 'Arama',
    'tabs.orders': 'Siparişlerim',
    'tabs.profile': 'Profilim',

    // Menu screens
    'menu.selection': 'Yemek Seçimi',
    'order.summary': 'Sipariş Özeti',
    'payment.screen': 'Ödeme Ekranı',
    
    // Home Screen
    'location.select': 'Konum Seç',
    'search.placeholder': 'Restoran veya yemek ara...',
    'ai.askQuestion': 'Yapay zekaya soru sor',
    'toggle.weekly': 'Haftalık',
    'toggle.daily': 'Günlük',
    'home.categories': 'Kategoriler',
    'home.popularRestaurants': 'Popüler Restoranlar',
    'restaurant.tastyFood': 'Lezzetli yemekler',
    
    // Categories
    'category.pizza': 'Pizza',
    'category.burger': 'Burger',
    'category.kebap': 'Kebap',
    'category.dessert': 'Tatlı',
    'category.drinks': 'İçecek',
    'category.breakfast': 'Kahvaltı',
    
    // Search Screen
    'search.recentSearches': 'Son Aramalar',
    'search.popularCategories': 'Popüler Kategoriler',
    'search.results': 'Arama Sonuçları',
    'search.noResults': 'Sonuç bulunamadı',
    
    // Orders Screen
    'orders.pastOrders': 'Geçmiş Siparişler',
    'orders.activeOrders': 'Aktif Siparişler',
    'orders.summary': 'Sipariş Özeti',
    'orders.delivered': 'Teslim edildi',
    'orders.reorder': 'Tekrar Sipariş Ver',
    'orders.noOrdersYet': 'Henüz siparişiniz bulunmamaktadır.',
    'orders.noActiveOrders': 'Şu anda aktif siparişiniz bulunmamaktadır.',
    'orders.orderNow': 'Hemen Sipariş Ver',
  },

  en: {
    // Common
    'app.name': 'Yuumi',
    'loading': 'Loading',
    'cancel': 'Cancel',
    'anonymous': 'Anonymous User',
    'no.email': 'No email',
    'no.phone': 'No phone',
    'logout.title': 'Logout',
    'logout.confirm': 'Are you sure you want to log out of your account?',

    // Auth screens
    'login.title': 'Login',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.button': 'Login',
    'login.register': "Don't have an account? Register",
    'login.forgot': 'Forgot Password',

    'register.title': 'Create Account',
    'register.name': 'Full Name',
    'register.email': 'Email',
    'register.phone': 'Phone',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.button': 'Register',
    'register.login': 'Already have an account? Login',

    // Profile screen
    'profile.title': 'My Profile',
    'profile.account': 'Account',
    'profile.preferences': 'Preferences',
    'profile.other': 'Other',
    'profile.profileInfo': 'Profile Information',
    'profile.addresses': 'My Addresses',
    'profile.paymentMethods': 'Payment Methods',
    'profile.notifications': 'Notification Settings',
    'profile.language': 'Language Options',
    'profile.support': 'Help & Support',
    'profile.logout': 'Logout',
    
    // Edit Profile Screen
    'profile.personalInfo': 'Personal Information',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone Number',
    'profile.enterFirstName': 'Enter your first name',
    'profile.enterLastName': 'Enter your last name',
    'profile.enterPhone': 'Enter your phone number',
    'profile.cantChangeEmail': 'Email address cannot be changed',
    'profile.saveChanges': 'Save Changes',

    // Bottom tabs
    'tabs.food': 'Food',
    'tabs.search': 'Search',
    'tabs.orders': 'My Orders',
    'tabs.profile': 'Profile',
    
    // Menu screens
    'menu.selection': 'Food Selection',
    'order.summary': 'Order Summary',
    'payment.screen': 'Payment',
    
    // Home Screen
    'location.select': 'Select Location',
    'search.placeholder': 'Search for restaurants or food...',
    'ai.askQuestion': 'Ask AI a question',
    'toggle.weekly': 'Weekly',
    'toggle.daily': 'Daily',
    'home.categories': 'Categories',
    'home.popularRestaurants': 'Popular Restaurants',
    'restaurant.tastyFood': 'Delicious food',
    
    // Categories
    'category.pizza': 'Pizza',
    'category.burger': 'Burger',
    'category.kebap': 'Kebab',
    'category.dessert': 'Dessert',
    'category.drinks': 'Drinks',
    'category.breakfast': 'Breakfast',
    
    // Search Screen
    'search.recentSearches': 'Recent Searches',
    'search.popularCategories': 'Popular Categories',
    'search.results': 'Search Results',
    'search.noResults': 'No results found',
    
    // Orders Screen
    'orders.pastOrders': 'Past Orders',
    'orders.activeOrders': 'Active Orders',
    'orders.summary': 'Order Summary',
    'orders.delivered': 'Delivered',
    'orders.reorder': 'Reorder',
    'orders.noOrdersYet': 'You have no orders yet.',
    'orders.noActiveOrders': 'You have no active orders at the moment.',
    'orders.orderNow': 'Order Now',
  },
};

// Context type definition
interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => Promise<void>;
  t: (key: string) => string;
  availableLanguages: Language[];
  getCurrentLanguage: () => Language;
}

// Storage key
const LANGUAGE_STORAGE_KEY = '@yuumi_language';

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('tr'); // Default language is Turkish
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Load saved language on initial render
  useEffect(() => {
    let isMounted = true;
    
    const loadSavedLanguage = async () => {
      try {
        // Use our safe AsyncStorage wrapper
        const savedLanguage = await safeAsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (savedLanguage && Object.keys(translations).includes(savedLanguage) && isMounted) {
          setLanguageState(savedLanguage as LanguageCode);
        }
        
        if (isMounted) setIsStorageReady(true);
      } catch (error) {
        console.error('Error loading language setting:', error);
        if (isMounted) setIsStorageReady(true);
      }
    };
    
    loadSavedLanguage();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Set language and persist to storage
  const setLanguage = async (code: LanguageCode) => {
    try {
      setLanguageState(code);
      
      // Only attempt to save if safe
      if (isStorageReady) {
        await safeAsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
        
        // Önemli: Olay gönder - dil değiştiğinde tüm component'leri haberdar et
        // App.tsx içindeki useEffect bunu yakalayıp uygulamayı yeniden başlatacak
        console.log(`Language changed to ${code}`);
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  // Translate function
  const t = (key: string): string => {
    // Safely access translations
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    return key;
  };

  // Get current language object
  const getCurrentLanguage = (): Language => {
    return LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages: LANGUAGES,
    getCurrentLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 