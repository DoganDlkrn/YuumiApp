// App.tsx
import React, { useState, useEffect, ErrorInfo } from "react";
import { StyleSheet, StatusBar, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigation";
import CustomNavigationContainer from "./src/navigation/NavigationContainer";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import * as Animatable from "react-native-animatable";
import YLogo from "./src/components/YLogo";

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log("App error caught:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      // Error screen
      return (
        <View style={errorStyles.container}>
          <YLogo size={80} color="#00B2FF" />
          <Text style={errorStyles.title}>Bir şeyler yanlış gitti</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || "Beklenmeyen bir hata oluştu"}
          </Text>
          <TouchableOpacity 
            style={errorStyles.button} 
            onPress={this.resetError}
          >
            <Text style={errorStyles.buttonText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NavigationContainer>
              <CustomNavigationContainer>
                <View style={styles.container}>
                  <StatusBar
                    barStyle="light-content"
                    backgroundColor="#00B2FF"
                    translucent={false}
                  />
                  <AppNavigator />
                </View>
              </CustomNavigationContainer>
            </NavigationContainer>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
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
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}