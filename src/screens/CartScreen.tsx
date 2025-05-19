import React, { useEffect, useState } from 'react';
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
  const { items, removeItem, getTotal, clearCart, addItem, debugCart } = useCart();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  const [refreshCart, setRefreshCart] = useState(0);

  // Debug cart contents when screen is focused
  useEffect(() => {
    console.log("CartScreen mounted - debugging cart contents:");
    debugCart();
    
    // Force refresh immediately when screen mounts
    setRefreshCart(prev => prev + 1);
    
    // Then refresh every 1 second to ensure cart updates are visible
    const intervalId = setInterval(() => {
      setRefreshCart(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Group items by restaurant - simplified to avoid duplicate counting
  const groupedItems = React.useMemo(() => {
    console.log(`Regrouping items - current cart has ${items.length} items`);
    const groups: { [restaurantId: string]: CartItem[] } = {};
    
    // Create a map to track added items by ID to avoid duplicates
    const addedItems = new Map<string, CartItem>();
    
    items.forEach(item => {
      // If this is a new restaurant, initialize its array
      if (!groups[item.restaurantId]) {
        groups[item.restaurantId] = [];
      }
      
      // Check if we've already added this item ID
      if (addedItems.has(item.id)) {
        // If this item already exists, just update its quantity
        const existingItem = addedItems.get(item.id)!;
        existingItem.quantity = (existingItem.quantity || 0) + (item.quantity || 1);
      } else {
        // This is a new item, add it to both the group and our tracking map
        const newItem = {...item};
        groups[item.restaurantId].push(newItem);
        addedItems.set(item.id, newItem);
      }
    });
    
    // Debug the grouped items
    console.log(`Grouped items into ${Object.keys(groups).length} restaurants`);
    Object.keys(groups).forEach(restaurantId => {
      console.log(`Restaurant ${restaurantId} has ${groups[restaurantId].length} unique items`);
    });
    
    return groups;
  }, [items, refreshCart]);

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
            Alert.alert('Başarılı', 'Siparişiniz alınmıştır.');
            clearCart();
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  // Handle incrementing item quantity
  const handleIncrement = (item: CartItem) => {
    console.log(`Incrementing item: ${item.name}`);
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName
    });
    setRefreshCart(prev => prev + 1);
  };

  const renderRestaurantSection = ({ restaurantId, items }: { restaurantId: string, items: CartItem[] }) => {
    // Find the first item for restaurant name
    const restaurantName = items[0]?.restaurantName || '';
    
    return (
      <View style={styles.restaurantSection} key={restaurantId}>
        <Text style={styles.restaurantName}>{restaurantName}</Text>
        
        {items.map(item => (
          <View style={styles.cartItem} key={`${item.id}-${item.quantity}`}>
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName}>{item.name}</Text>
              <View style={styles.cartItemPriceRow}>
                <Text style={styles.cartItemPrice}>{item.price} ₺</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleIncrement(item)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.itemTotal}>
              <Text style={styles.itemTotalText}>
                {(item.price * item.quantity).toFixed(2)} ₺
              </Text>
            </View>
          </View>
        ))}
        
        <View style={styles.restaurantTotal}>
          <Text style={styles.restaurantTotalText}>Ara Toplam:</Text>
          <Text style={styles.restaurantTotalAmount}>
            {items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} ₺
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{"←"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('cart.title')}</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {items.length > 0 ? (
          <FlatList
            data={Object.keys(groupedItems).map(restaurantId => ({
              restaurantId,
              items: groupedItems[restaurantId]
            }))}
            renderItem={({ item }) => renderRestaurantSection(item)}
            keyExtractor={item => item.restaurantId}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              <View style={styles.totalSection}>
                <Text style={styles.totalText}>{t('cart.total')}</Text>
                <Text style={styles.totalAmount}>{getTotal().toFixed(2)} ₺</Text>
                <TouchableOpacity 
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
                >
                  <Text style={styles.checkoutButtonText}>Siparişi Tamamla</Text>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    marginRight: 10,
  },
  placeholder: {
    flex: 1,
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
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 25,
    textAlign: 'center',
  },
  itemTotal: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  restaurantSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00B2FF',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  restaurantTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1, 
    borderTopColor: '#eee',
  },
  restaurantTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  restaurantTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B2FF',
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    marginRight: 10,
  },
  placeholder: {
    flex: 1,
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
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 25,
    textAlign: 'center',
    color: '#fff',
  },
  itemTotal: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  restaurantSection: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginBottom: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4fc3f7',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  restaurantTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1, 
    borderTopColor: '#333',
  },
  restaurantTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ddd',
  },
  restaurantTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4fc3f7',
  },
}); 