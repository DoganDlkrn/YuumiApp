import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface FloatingActionBarProps {
  itemCount: number;
  totalPrice: number;
  onContinue?: () => void; // Haftalık plan için "Devam Et" fonksiyonu
  onGoToCart: () => void;
  showContinueButton: boolean; // "Devam Et" butonunu gösterip göstermeyeceğimizi belirler
  continueButtonText?: string; // "Devam Et" butonu için özel metin (opsiyonel)
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  itemCount,
  totalPrice,
  onContinue,
  onGoToCart,
  showContinueButton,
  continueButtonText = "Devam Et",
}) => {
  if (itemCount === 0) {
    return null; // Sepette ürün yoksa çubuğu gösterme
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.itemCountText}>{itemCount} ürün</Text>
        <Text style={styles.totalPriceText}>₺{totalPrice.toFixed(2)}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        {showContinueButton && onContinue && (
          <TouchableOpacity style={[styles.button, styles.continueButton]} onPress={onContinue}>
            <Text style={[styles.buttonText, styles.continueButtonText]}>{continueButtonText}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.goToCartButton, 
            !showContinueButton && {flex: 1}
          ]} 
          onPress={onGoToCart}
        >
          <Text style={[styles.buttonText, styles.goToCartButtonText]}>Sepete Git</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80, // Bottom tab bar için yer bırak
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemCountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalPriceText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#00B2FF',
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 80,
  },
  continueButton: {
    backgroundColor: '#00B2FF',
    flex: 1,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  goToCartButton: {
    backgroundColor: '#f0f0f0',
  },
  goToCartButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  }
});

export default FloatingActionBar; 