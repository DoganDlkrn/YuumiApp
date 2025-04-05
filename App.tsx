// App.tsx
import React, { useState, useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StyleSheet, StatusBar, View, Image } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigation";

function ThemedNavigationContainer() {
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
        <Image
          source={require("./src/assets/Y.png")}
          style={styles.splashImage}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DefaultTheme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#00B2FF"
          translucent={false}
        />
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
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
    <ThemedNavigationContainer />
  );
}