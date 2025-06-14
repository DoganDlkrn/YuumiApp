/*
 * ANA UYGULAMA KOMPONENTİ (App.tsx)
 * 
 * Bu dosya uygulamanın kök bileşenidir ve şu sistemleri organize eder:
 * 
 * 1. CONTEXT PROVİDER'LAR:
 *    - ThemeProvider: Açık/koyu tema yönetimi
 *    - LanguageProvider: Çoklu dil desteği (TR/EN)
 *    - AuthProvider: Firebase kimlik doğrulama
 *    - CartProvider: Sepet verilerini global yönetim
 * 
 * 2. NAVİGASYON SİSTEMİ:
 *    - React Navigation v6 ile ekranlar arası geçiş
 *    - Animasyonları kapatılmış performans için
 *    - CustomNavigationContainer ile özelleştirilmiş
 * 
 * 3. HATA YÖNETİMİ:
 *    - ErrorBoundary ile uygulama seviyesi hata yakalama
 *    - Dil bazlı hata mesajları
 *    - Graceful error recovery sistemi
 * 
 * 4. BAŞLANGIÇ EKRANI:
 *    - 1.5 saniye splash screen
 *    - Animasyonlu Yuumi logosu
 *    - Mavi markalama rengi (#00B2FF)
 * 
 * 5. PERFORMANS OPTİMİZASYONU:
 *    - enableScreens(true) ile React Native Screens
 *    - Animasyonlar devre dışı
 *    - detachInactiveScreens=true
 */

// App.tsx
import React, { useState, useEffect, ErrorInfo, useContext } from "react";
import { StyleSheet, StatusBar, View, Text, TouchableOpacity, Platform, UIManager } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from 'react-native-screens';
import AppNavigator from "./src/navigation/AppNavigation";
import CustomNavigationContainer from "./src/navigation/NavigationContainer";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { LanguageProvider, useLanguage, LanguageCode } from "./src/context/LanguageContext";
import { CartProvider } from './src/screens/CartScreen';
import * as Animatable from "react-native-animatable";
import YLogo from "./src/components/YLogo";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable screens for better performance and disable animations
enableScreens(true);

// Configure screen options to disable animations
if (Platform.OS === 'ios') {
  // iOS specific configuration
  UIManager.setLayoutAnimationEnabledExperimental && 
  UIManager.setLayoutAnimationEnabledExperimental(false);
}

// Create a custom theme with no animations
const NoAnimationTheme = {
  dark: false,
  colors: {
    primary: '#00B2FF',
    background: 'white',
    card: 'white',
    text: '#333333',
    border: '#DDDDDD',
    notification: '#FF3B30',
  },
  animation: 'none',
  animationEnabled: false
};

// Custom navigation options to disable animations
const navigationOptions = {
  screenOptions: {
    animationEnabled: false,
    gestureEnabled: false
  }
};

// Error translations
const errorTranslations = {
  tr: {
    errorTitle: 'Bir şeyler yanlış gitti',
    errorDefault: 'Beklenmeyen bir hata oluştu',
    errorRetry: 'Yeniden Dene'
  },
  en: {
    errorTitle: 'Something went wrong',
    errorDefault: 'An unexpected error occurred',
    errorRetry: 'Try Again'
  }
};

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, language: LanguageCode}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      language: 'tr' // Default to Turkish
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log("App error caught:", error, errorInfo);
  }

  async componentDidMount() {
    // Load saved language
    try {
      const savedLanguage = await AsyncStorage.getItem('@yuumi_language');
      if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        this.setState({ language: savedLanguage as LanguageCode });
      }
    } catch (error) {
      console.error("Error loading language in error boundary:", error);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      // Get translations based on current language
      const texts = errorTranslations[this.state.language];
      
      // Error screen
      return (
        <View style={errorStyles.container}>
          <YLogo size={80} color="#00B2FF" />
          <Text style={errorStyles.title}>{texts.errorTitle}</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || texts.errorDefault}
          </Text>
          <TouchableOpacity 
            style={errorStyles.button} 
            onPress={this.resetError}
          >
            <Text style={errorStyles.buttonText}>{texts.errorRetry}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [appKey, setAppKey] = useState(0);

  // Get the current language
  const { language } = useLanguage();

  // When language changes, reload the app
  useEffect(() => {
    // This will force the app to re-render completely
    console.log(`Language changed in AppContent: ${language}`);
    
    // Biraz gecikme ekleyerek dil değişiminin tüm bileşenlere dağılmasını sağlayalım
    const timer = setTimeout(() => {
      setAppKey(prevKey => prevKey + 1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [language]);

  useEffect(() => {
    // Splash screen for 1.5 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 1500); 
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={styles.logoContainer}
        >
          <YLogo size={150} color="#FFFFFF" />
        </Animatable.View>
      </View>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics} key={appKey}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#00B2FF"
          translucent={false}
        />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: "#00B2FF",
    justifyContent: "center",
    alignItems: "center",
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#00B2FF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <NavigationContainer
                theme={NoAnimationTheme}
                documentTitle={{
                  enabled: false
                }}
                linking={{
                  enabled: false
                }}
                detachInactiveScreens={true}
              >
                <CustomNavigationContainer>
                  <AppContent />
                </CustomNavigationContainer>
              </NavigationContainer>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  );
}