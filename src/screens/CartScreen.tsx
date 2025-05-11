import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Alert,
  ImageSourcePropType
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useCart, CartItem } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Import images
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');
const deleteIcon: ImageSourcePropType = require('../assets/images/trash.png');

type CartScreenNavProp = StackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation() as CartScreenNavProp;
  const { items, removeItem, getTotal, clearCart } = useCart();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    
    Alert.alert(
      t('cart.title'),
      t('cart.checkout'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('cart.checkout'),
          onPress: () => {
            // Process checkout logic here
            Alert.alert('Success', 'Order placed successfully');
            clearCart();
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemRestaurant}>{item.restaurantName}</Text>
        <View style={styles.cartItemPriceRow}>
          <Text style={styles.cartItemPrice}>{item.price} ₺</Text>
          <Text style={styles.cartItemQuantity}>x {item.quantity}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Text style={styles.removeButtonText}>{t('cart.remove')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme === 'dark' ? "#1e88e5" : "#00B2FF"} />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>{t('cart.title')}</Text>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {items.length > 0 ? (
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              <View style={styles.totalSection}>
                <Text style={styles.totalText}>{t('cart.total')}</Text>
                <Text style={styles.totalAmount}>{getTotal().toFixed(2)} ₺</Text>
                <TouchableOpacity 
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
                >
                  <Text style={styles.checkoutButtonText}>{t('cart.checkout')}</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>{t('cart.empty')}</Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>{t('orders.orderNow')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          activeOpacity={1.0}
          onPress={() => navigation.navigate('Home')}
        >
          <Image source={restaurantIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.food')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          activeOpacity={1.0}
          onPress={() => navigation.navigate('Search')}
        >
          <Image source={searchIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.search')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          activeOpacity={1.0}
          onPress={() => navigation.navigate('Orders')}
        >
          <Image source={orderIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.orders')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          activeOpacity={1.0}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image source={userIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.profile')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B2FF',
  },
  headerSection: {
    backgroundColor: '#00B2FF',
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginLeft: 16,
    marginBottom: 10,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cartItemRestaurant: {
    fontSize: 14,
    color: '#00B2FF',
    marginBottom: 8,
  },
  cartItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  totalSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00B2FF',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#00B2FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#777',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#00B2FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    backgroundColor: 'white',
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 25 : 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  tabIcon: {
    width: 22,
    height: 22,
    tintColor: '#aaa',
    marginBottom: 5,
  },
  tabLabel: {
    fontSize: 12,
    color: '#aaa',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e88e5',
  },
  headerSection: {
    backgroundColor: '#1e88e5',
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginLeft: 16,
    marginBottom: 10,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cartItemRestaurant: {
    fontSize: 14,
    color: '#4fc3f7',
    marginBottom: 8,
  },
  cartItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cartItemQuantity: {
    fontSize: 14,
    color: '#bbb',
    marginLeft: 10,
  },
  removeButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  totalSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4fc3f7',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1a1a1a',
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 25 : 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  tabIcon: {
    width: 22,
    height: 22,
    tintColor: '#777',
    marginBottom: 5,
  },
  tabLabel: {
    fontSize: 12,
    color: '#777',
  },
}); 