import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function OrderSummaryScreen() {
  const navigation = useNavigation();

  const route = useRoute();
  const { selectedMeals } = route.params as { selectedMeals: string[] };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sipariş Özeti</Text>

      <FlatList
        data={selectedMeals}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.mealItem}>
            <Text style={styles.mealText}>{item}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.payButton}
        onPress={() => {
          console.log("Ödeme yap tıklandı!");
        }}
      >
        <Text style={styles.payButtonText}>Ödeme Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  mealItem: {
    backgroundColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  mealText: {
    fontSize: 18,
    color: "#2c3e50",
  },
  payButton: {
    marginTop: 20,
    backgroundColor: "#64b5f6",
    padding: 15,
    alignItems: "center",
    borderRadius: 25,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});