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
export type LanguageCode = 'tr' | 'en' | 'fr' | 'de' | 'es';

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
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

    // Bottom tabs
    'tabs.food': 'Yemek',
    'tabs.search': 'Arama',
    'tabs.orders': 'Siparişlerim',
    'tabs.profile': 'Profilim',
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

    // Bottom tabs
    'tabs.food': 'Food',
    'tabs.search': 'Search',
    'tabs.orders': 'My Orders',
    'tabs.profile': 'Profile',
  },

  fr: {
    // Common
    'app.name': 'Yuumi',
    'loading': 'Chargement',
    'cancel': 'Annuler',
    'anonymous': 'Utilisateur Anonyme',
    'no.email': 'Pas d\'email',
    'no.phone': 'Pas de téléphone',
    'logout.title': 'Déconnexion',
    'logout.confirm': 'Êtes-vous sûr de vouloir vous déconnecter de votre compte?',

    // Auth screens
    'login.title': 'Connexion',
    'login.email': 'E-mail',
    'login.password': 'Mot de passe',
    'login.button': 'Se connecter',
    'login.register': "Pas de compte? S'inscrire",
    'login.forgot': 'Mot de passe oublié',

    'register.title': 'Créer un compte',
    'register.name': 'Nom complet',
    'register.email': 'E-mail',
    'register.phone': 'Téléphone',
    'register.password': 'Mot de passe',
    'register.confirmPassword': 'Confirmer le mot de passe',
    'register.button': "S'inscrire",
    'register.login': 'Vous avez déjà un compte? Connectez-vous',

    // Profile screen
    'profile.title': 'Mon Profil',
    'profile.account': 'Compte',
    'profile.preferences': 'Préférences',
    'profile.other': 'Autre',
    'profile.profileInfo': 'Informations du profil',
    'profile.addresses': 'Mes adresses',
    'profile.paymentMethods': 'Moyens de paiement',
    'profile.notifications': 'Paramètres de notification',
    'profile.language': 'Options de langue',
    'profile.support': 'Aide et support',
    'profile.logout': 'Déconnexion',

    // Bottom tabs
    'tabs.food': 'Nourriture',
    'tabs.search': 'Recherche',
    'tabs.orders': 'Mes commandes',
    'tabs.profile': 'Profil',
  },

  de: {
    // Common
    'app.name': 'Yuumi',
    'loading': 'Wird geladen',
    'cancel': 'Abbrechen',
    'anonymous': 'Anonymer Benutzer',
    'no.email': 'Keine E-Mail',
    'no.phone': 'Kein Telefon',
    'logout.title': 'Abmelden',
    'logout.confirm': 'Sind Sie sicher, dass Sie sich von Ihrem Konto abmelden möchten?',

    // Auth screens
    'login.title': 'Anmelden',
    'login.email': 'E-Mail',
    'login.password': 'Passwort',
    'login.button': 'Anmelden',
    'login.register': 'Kein Konto? Registrieren',
    'login.forgot': 'Passwort vergessen',

    'register.title': 'Konto erstellen',
    'register.name': 'Vollständiger Name',
    'register.email': 'E-Mail',
    'register.phone': 'Telefon',
    'register.password': 'Passwort',
    'register.confirmPassword': 'Passwort bestätigen',
    'register.button': 'Registrieren',
    'register.login': 'Haben Sie bereits ein Konto? Anmelden',

    // Profile screen
    'profile.title': 'Mein Profil',
    'profile.account': 'Konto',
    'profile.preferences': 'Einstellungen',
    'profile.other': 'Sonstiges',
    'profile.profileInfo': 'Profilinformationen',
    'profile.addresses': 'Meine Adressen',
    'profile.paymentMethods': 'Zahlungsmethoden',
    'profile.notifications': 'Benachrichtigungseinstellungen',
    'profile.language': 'Sprachoptionen',
    'profile.support': 'Hilfe & Support',
    'profile.logout': 'Abmelden',

    // Bottom tabs
    'tabs.food': 'Essen',
    'tabs.search': 'Suche',
    'tabs.orders': 'Meine Bestellungen',
    'tabs.profile': 'Profil',
  },

  es: {
    // Common
    'app.name': 'Yuumi',
    'loading': 'Cargando',
    'cancel': 'Cancelar',
    'anonymous': 'Usuario Anónimo',
    'no.email': 'Sin correo',
    'no.phone': 'Sin teléfono',
    'logout.title': 'Cerrar sesión',
    'logout.confirm': '¿Estás seguro de que quieres cerrar sesión en tu cuenta?',

    // Auth screens
    'login.title': 'Iniciar sesión',
    'login.email': 'Correo electrónico',
    'login.password': 'Contraseña',
    'login.button': 'Iniciar sesión',
    'login.register': '¿No tienes cuenta? Regístrate',
    'login.forgot': 'Olvidé mi contraseña',

    'register.title': 'Crear cuenta',
    'register.name': 'Nombre completo',
    'register.email': 'Correo electrónico',
    'register.phone': 'Teléfono',
    'register.password': 'Contraseña',
    'register.confirmPassword': 'Confirmar contraseña',
    'register.button': 'Registrarse',
    'register.login': '¿Ya tienes una cuenta? Inicia sesión',

    // Profile screen
    'profile.title': 'Mi perfil',
    'profile.account': 'Cuenta',
    'profile.preferences': 'Preferencias',
    'profile.other': 'Otros',
    'profile.profileInfo': 'Información del perfil',
    'profile.addresses': 'Mis direcciones',
    'profile.paymentMethods': 'Métodos de pago',
    'profile.notifications': 'Configuración de notificaciones',
    'profile.language': 'Opciones de idioma',
    'profile.support': 'Ayuda y soporte',
    'profile.logout': 'Cerrar sesión',

    // Bottom tabs
    'tabs.food': 'Comida',
    'tabs.search': 'Buscar',
    'tabs.orders': 'Mis pedidos',
    'tabs.profile': 'Perfil',
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