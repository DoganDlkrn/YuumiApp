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
    'success': 'Başarılı',
    'order.received': 'Siparişiniz alınmıştır.',
    'attention': 'Dikkat',
    'confirm.complete.order': 'Bu siparişi tamamlamak istediğinize emin misiniz?',
    'confirm': 'Onayla',
    'complete': 'Tamamla',
    'ok': 'Tamam',
    'error': 'Hata',

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
    'location.add': 'Konum Seç',
    'search.placeholder': 'Restoran veya yemek ara...',
    'ai.askQuestion': 'Yapay zekaya soru sor',
    'toggle.weekly': 'Haftalık',
    'toggle.daily': 'Günlük',
    'home.categories': 'Kategoriler',
    'home.popularRestaurants': 'Popüler Restoranlar',
    'restaurant.tastyFood': 'Lezzetli yemekler',
    'home.popularCategories': 'Popüler Kategoriler',
    
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
    'search.notFound': 'Aradığın ürünü bulamadık',
    'search.noRecentSearches': 'Henüz arama yapmadınız',
    'search.category': 'Kategori',
    'search.restaurant': 'Restoran',
    
    // Orders Screen
    'orders.pastOrders': 'Geçmiş Siparişler',
    'orders.activeOrders': 'Aktif Siparişler',
    'orders.summary': 'Sipariş Özeti',
    'orders.delivered': 'Teslim edildi',
    'orders.pending': 'Beklemede',
    'orders.preparing': 'Hazırlanıyor',
    'orders.onTheWay': 'Yolda',
    'orders.reorder': 'Tekrar Sipariş Ver',
    'orders.rate': 'Değerlendir',
    'orders.noOrdersYet': 'Henüz siparişiniz bulunmamaktadır.',
    'orders.noActiveOrders': 'Şu anda aktif siparişiniz bulunmamaktadır.',
    'orders.orderNow': 'Hemen Sipariş Ver',

    // New translations for Turkish
    'profile.notificationSettings': 'İletişim Tercihlerim',
    'notifications.settings': 'İletişim Tercihlerim',
    'notifications.email': 'E-posta',
    'notifications.emailDescription': 'Kampanyalarla ilgili e-posta almak istiyorum.',
    'notifications.push': 'Bildirim',
    'notifications.pushDescription': 'Kampanyalarla ilgili bildirim almak istiyorum.',
    'notifications.sms': 'SMS',
    'notifications.smsDescription': 'Kampanyalarla ilgili SMS almak istiyorum.',
    'notifications.phone': 'Telefon',
    'notifications.phoneDescription': 'Kampanyalarla ilgili cep telefonumdan aranmak istiyorum.',
    'notifications.disclaimer': '*Kampanyalarla ilgili iletişim tercihlerini kapattığında siparişlerin ve üyelik ayarlarınla ilgili e-posta / bildirim almaya devam edersin.',

    // Cart related
    'cart.title': 'Sepetim',
    'cart.empty': 'Sepetiniz boş',
    'cart.total': 'Toplam',
    'cart.checkout': 'Ödeme Yap',
    'cart.remove': 'Kaldır',
    'cart.added': 'Sepete eklendi',
    'cart.items': 'ürün',
    'cart.goto': 'Sepete Git',
    'cart.added.to': 'sepete eklendi',
    
    // Time and planning
    'time.select': 'Saat Seç',
    'delivery.time.select': 'Teslimat saati seçin',
    'hour': 'Saat',
    'minute': 'Dakika',
    'planning.for': 'için planlama',
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
    'success': 'Success',
    'order.received': 'Your order has been received.',
    'attention': 'Attention',
    'confirm.complete.order': 'Are you sure you want to complete this order?',
    'confirm': 'Confirm',
    'complete': 'Complete',
    'ok': 'OK',
    'error': 'Error',

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
    'tabs.orders': 'Orders',
    'tabs.profile': 'Profile',

    // Menu screens
    'menu.selection': 'Menu Selection',
    'order.summary': 'Order Summary',
    'payment.screen': 'Payment',
    
    // Home Screen
    'location.select': 'Select Location',
    'location.add': 'Add Location',
    'search.placeholder': 'Search for restaurants or food...',
    'ai.askQuestion': 'Ask AI a question',
    'toggle.weekly': 'Weekly',
    'toggle.daily': 'Daily',
    'home.categories': 'Categories',
    'home.popularRestaurants': 'Popular Restaurants',
    'restaurant.tastyFood': 'Tasty food',
    'home.popularCategories': 'Popular Categories',
    
    // Categories
    'category.pizza': 'Pizza',
    'category.burger': 'Burger',
    'category.kebap': 'Kebap',
    'category.dessert': 'Dessert',
    'category.drinks': 'Drinks',
    'category.breakfast': 'Breakfast',
    
    // Search Screen
    'search.recentSearches': 'Recent Searches',
    'search.popularCategories': 'Popular Categories',
    'search.results': 'Search Results',
    'search.noResults': 'No results found',
    'search.notFound': 'We couldn\'t find the product you were looking for',
    'search.noRecentSearches': 'No recent searches yet',
    'search.category': 'Category',
    'search.restaurant': 'Restaurant',
    
    // Orders Screen
    'orders.pastOrders': 'Past Orders',
    'orders.activeOrders': 'Active Orders',
    'orders.summary': 'Order Summary',
    'orders.delivered': 'Delivered',
    'orders.pending': 'Pending',
    'orders.preparing': 'Preparing',
    'orders.onTheWay': 'On the way',
    'orders.reorder': 'Reorder',
    'orders.rate': 'Rate',
    'orders.noOrdersYet': 'You don\'t have any orders yet.',
    'orders.noActiveOrders': 'You don\'t have any active orders at the moment.',
    'orders.orderNow': 'Order Now',

    // New translations for English
    'profile.notificationSettings': 'Communication Preferences',
    'notifications.settings': 'Communication Preferences',
    'notifications.email': 'Email',
    'notifications.emailDescription': 'I want to receive emails about promotions.',
    'notifications.push': 'Push Notifications',
    'notifications.pushDescription': 'I want to receive push notifications about promotions.',
    'notifications.sms': 'SMS',
    'notifications.smsDescription': 'I want to receive SMS about promotions.',
    'notifications.phone': 'Phone',
    'notifications.phoneDescription': 'I want to be called on my mobile phone about promotions.',
    'notifications.disclaimer': '*When you turn off communication preferences for promotions, you will still receive emails / notifications about your orders and membership settings.',

    // Cart related
    'cart.title': 'My Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.remove': 'Remove',
    'cart.added': 'Added to cart',
    'cart.added.to': 'added to cart',
    'cart.items': 'items',
    'cart.goto': 'Go to Cart',
    'completeOrder': 'Complete Order',
    'subtotal': 'Subtotal',
    'unknownRestaurant': 'Unknown Restaurant',
    
    // Time and planning
    'time.select': 'Select Time',
    'delivery.time.select': 'Select delivery time',
    'hour': 'Hour',
    'minute': 'Minute',
    'planning.for': 'planning for',
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