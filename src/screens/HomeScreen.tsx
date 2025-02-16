import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";

type HomeScreenNavProp = StackNavigationProp<RootStackParamList, "Home">;
const SIcon = require("../assets/letter-s.png");

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavProp>();

  return (
    <View style={styles.container}>
      <Image source={SIcon} style={styles.logo} />
      <Text style={styles.title}>SmartMeal</Text>
      <Text style={styles.subtitle}>Haftalık yemeklerinizi hızlı ve kolay seçin!</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MenuSelection")}
      >
        <Text style={styles.buttonText}>Yemekleri Seç</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#64b5f6",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});