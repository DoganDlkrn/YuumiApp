// App.tsx
import React, { useState, useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaView, StyleSheet, StatusBar, View, Image } from "react-native";
import AppNavigator from "./src/navigation/AppNavigation";

function ThemedNavigationContainer() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    <NavigationContainer theme={DefaultTheme}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00B2FF"
        translucent={true}
      />
      <SafeAreaView style={[styles.container, {backgroundColor: '#00B2FF'}]}>
        <AppNavigator />
      </SafeAreaView>
    </NavigationContainer>
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