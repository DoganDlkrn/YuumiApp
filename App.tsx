// App.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet, StatusBar, View } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigation";
import CustomNavigationContainer from "./src/navigation/NavigationContainer";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import * as Animatable from "react-native-animatable";
import YLogo from "./src/components/YLogo";

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

export default function App() {
  return (
    <AppContent />
  );
}