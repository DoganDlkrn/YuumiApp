import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView, StyleSheet, StatusBar } from "react-native";
import AppNavigator from "./src/navigation/AppNavigation";
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
      
      <SafeAreaView style={styles.container}>
        <AppNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD", 
  },
});