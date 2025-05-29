import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ImageSourcePropType,
  Alert,
  Modal,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from '../navigation/AppNavigation';
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../screens/CartScreen";
import BottomTabBar from '../components/BottomTabBar';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, doc, getDoc, query, where, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Import images
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');

type OrdersScreenNavProp = StackNavigationProp<RootStackParamList, "Orders">;

// Sipariş tipi tanımlama
interface Order {
  id: string;
  restaurant: string;
  date: string;
  items: string[];
  status: string;
  total: string;
  isActive: boolean;
}

// Saklama anahtarı
const ORDERS_STORAGE_KEY = '@yuumi_orders';

export default function OrdersScreen() {
  const navigation = useNavigation() as OrdersScreenNavProp;
  const [activeTab, setActiveTab] = useState<'past' | 'active'>('active'); // Aktif sekmesi varsayılan olarak
  const { t } = useLanguage();
  const { items, clearCart } = useCart();
  
  // Geçmiş ve aktif siparişleri ayrı state'lerde tutuyoruz
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  
  // Rating modal state
  const [showRatingModalState, setShowRatingModalState] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // AsyncStorage'dan siparişleri yükle
  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders) as Order[];
        // Aktif ve geçmiş siparişleri ayır
        const active = parsedOrders.filter(order => order.isActive);
        const past = parsedOrders.filter(order => !order.isActive);
        
        setActiveOrders(active);
        setPastOrders(past);
        
        console.log(`[OrdersScreen][loadOrders] Loaded ${active.length} active orders and ${past.length} past orders`);
      }
    } catch (error) {
      console.error('Siparişler yüklenirken hata oluştu:', error);
    }
  };

  // Siparişleri kaydet
  const saveOrders = async (orders: Order[]) => {
    try {
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      console.log(`[OrdersScreen][saveOrders] Saved ${orders.length} orders to storage`);
    } catch (error) {
      console.error('Siparişler kaydedilirken hata oluştu:', error);
    }
  };

  // AsyncStorage'dan siparişleri yükle (helper function)
  const loadOrdersFromStorage = async (): Promise<Order[]> => {
    try {
      const savedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        return JSON.parse(savedOrders) as Order[];
      }
      return [];
    } catch (error) {
      console.error('Siparişler yüklenirken hata oluştu:', error);
      return [];
    }
  };

  // Sepet verilerinden yeni bir sipariş oluştur
  const createOrderFromCart = async () => {
    console.log('[OrdersScreen][createOrderFromCart] Sipariş oluşturuluyor');
    
    try {
      // Sipariş verilerini AsyncStorage'dan al
      const orderDataStr = await AsyncStorage.getItem('@new_order_data');
      if (!orderDataStr) {
        console.log('[OrdersScreen][createOrderFromCart] Sipariş verisi bulunamadı');
        return false;
      }
      
      const orderData = JSON.parse(orderDataStr);
      const orderItems = orderData.items || [];
      
      if (orderItems.length === 0) {
        console.log('[OrdersScreen][createOrderFromCart] Sipariş verilerinde öğe yok');
        return false;
      }

      console.log(`[OrdersScreen][createOrderFromCart] ${orderItems.length} öğe ile sipariş oluşturuluyor`);

      // Öğeleri restoranlara göre grupla
      const restaurantGroups: { [restaurantId: string]: any[] } = {};
      orderItems.forEach(item => {
        const key = item.restaurantId || 'unknown';
        if (!restaurantGroups[key]) {
          restaurantGroups[key] = [];
        }
        restaurantGroups[key].push(item);
      });

      console.log(`[OrdersScreen][createOrderFromCart] ${Object.keys(restaurantGroups).length} restoran grubu bulundu`);

      // Her restoran için ayrı sipariş oluştur
      const newOrders: Order[] = [];
      
      Object.keys(restaurantGroups).forEach(restaurantId => {
        const restaurantItems = restaurantGroups[restaurantId];
        const restaurantName = restaurantItems[0]?.restaurantName || t('unknownRestaurant');
        
        const total = restaurantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Yeni sipariş objesi
        const newOrder: Order = {
          id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          restaurant: restaurantName,
          date: new Date().toLocaleDateString('tr-TR', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          items: restaurantItems.map(item => `${item.name} x${item.quantity}`),
          status: t('orders.pending') || 'Beklemede',
          total: `${total.toFixed(2)} ₺`,
          isActive: true
        };

        console.log(`[OrdersScreen][createOrderFromCart] Yeni sipariş oluşturuldu:`, newOrder);
        newOrders.push(newOrder);
      });

      // Önce mevcut siparişleri yükle
      const existingOrders = await loadOrdersFromStorage();
      
      // Yeni siparişleri ekle
      const allOrders = [...existingOrders, ...newOrders];
      
      // AsyncStorage'a kaydet
      await saveOrders(allOrders);
      
      // State'leri güncelle
      const active = allOrders.filter(order => order.isActive);
      const past = allOrders.filter(order => !order.isActive);
      
      setActiveOrders(active);
      setPastOrders(past);
      
      // Sipariş verilerini temizle
      await AsyncStorage.removeItem('@new_order_data');
      
      console.log(`[OrdersScreen][createOrderFromCart] ${newOrders.length} yeni sipariş oluşturuldu ve kaydedildi`);
      console.log(`[OrdersScreen][createOrderFromCart] Toplam aktif sipariş: ${active.length}`);
      
      return true;
    } catch (error) {
      console.error('[OrdersScreen][createOrderFromCart] Sipariş oluşturma hatası:', error);
      return false;
    }
  };

  // Sipariş durumu değiştirme (aktif -> geçmiş)
  const completeOrder = async (orderId: string) => {
    try {
      // Siparişi bul ve durumunu güncelle
      const orderIndex = activeOrders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        const updatedOrder = { ...activeOrders[orderIndex], isActive: false, status: t('orders.delivered') };
        
        // Aktif siparişlerden kaldır
        const newActiveOrders = activeOrders.filter(order => order.id !== orderId);
        setActiveOrders(newActiveOrders);
        
        // Geçmiş siparişlere ekle
        const newPastOrders = [updatedOrder, ...pastOrders];
        setPastOrders(newPastOrders);
        
        // Tüm siparişleri güncelle ve kaydet
        const allOrders = [...newActiveOrders, ...newPastOrders];
        await saveOrders(allOrders);
        
        console.log(`[OrdersScreen][completeOrder] Order ${orderId} completed and moved to past orders`);
      }
    } catch (error) {
      console.error('[OrdersScreen][completeOrder] Error completing order:', error);
    }
  };

  // Show rating modal function
  const showRatingModal = (order: Order) => {
    setSelectedOrderForRating(order);
    setRating(0);
    setComment('');
    setShowRatingModalState(true);
  };

  // Close rating modal
  const closeRatingModal = () => {
    setShowRatingModalState(false);
    setSelectedOrderForRating(null);
    setRating(0);
    setComment('');
  };

  // Submit rating
  const submitRating = async () => {
    if (!selectedOrderForRating || rating === 0) {
      Alert.alert(
        t('error'),
        'Lütfen bir puan seçin',
        [{ text: t('ok'), onPress: () => {} }]
      );
      return;
    }

    try {
      // Restoran adına göre Firestore'dan restoran ID'sini bul
      const restaurantName = selectedOrderForRating.restaurant;
      
      // Firestore collection referanslarını oluştur
      const restaurantsCollection = collection(db, 'restaurants');
      
      // Restoran adına göre sorgula
      const q = query(restaurantsCollection, where('isim', '==', restaurantName));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Restoran bulunamadı');
      }
      
      // İlk eşleşen restoranı al
      const restaurantDoc = querySnapshot.docs[0];
      const restaurantId = restaurantDoc.id;
      const restaurantData = restaurantDoc.data();
      
      // Mevcut değerlendirme puanı ve sayısını kontrol et
      const currentRating = parseFloat(restaurantData.puan || '0') || 0;
      const currentReviewCount = restaurantData.reviewCount || 0;
      
      // Yeni değerlendirme puanını hesapla
      // Formül: (eski puan * eski değerlendirme sayısı + yeni puan) / (eski değerlendirme sayısı + 1)
      const newReviewCount = currentReviewCount + 1;
      const newRating = ((currentRating * currentReviewCount) + rating) / newReviewCount;
      
      // Restoran bilgilerini güncelle
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        puan: newRating.toFixed(1), // 4.5 formatında
        reviewCount: newReviewCount
      });
      
      // Değerlendirmeyi reviews koleksiyonuna kaydet
      const reviewsCollection = collection(db, 'reviews');
      await addDoc(reviewsCollection, {
        restaurantId,
        restaurantName,
        orderId: selectedOrderForRating.id,
        rating,
        comment,
        userId: 'current_user_id', // Gerçek uygulamada kullanıcı ID'si kullanılmalı
        createdAt: new Date().toISOString()
      });

      console.log('Rating submitted:', {
        orderId: selectedOrderForRating.id,
        restaurant: selectedOrderForRating.restaurant,
        rating,
        comment,
        newRestaurantRating: newRating.toFixed(1)
      });

      Alert.alert(
        t('success'),
        'Değerlendirmeniz kaydedildi!',
        [{ text: t('ok'), onPress: closeRatingModal }]
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert(
        t('error'),
        'Değerlendirme gönderilirken hata oluştu',
        [{ text: t('ok'), onPress: () => {} }]
      );
    }
  };

  // Sepetten sipariş oluşturma işlemini cart ekranından buraya yönlendirildiğimizde yap
  useFocusEffect(
    React.useCallback(() => {
      console.log('OrdersScreen odaklandı');
      loadOrders();
      
      // Kontrol parametresi ile geldi mi
      const checkForNewOrder = async () => {
        try {
          const hasNewOrder = await AsyncStorage.getItem('@new_order_from_cart');
          if (hasNewOrder === 'true') {
            console.log('OrdersScreen: Yeni sipariş işaretçisi bulundu, sipariş oluşturuluyor');
            const success = await createOrderFromCart();
            if (success) {
              console.log('OrdersScreen: Sipariş başarıyla oluşturuldu');
            } else {
              console.log('OrdersScreen: Sipariş oluşturulamadı');
            }
            // İşlemi bir kere yapacağımız için işaretçiyi temizle
            await AsyncStorage.removeItem('@new_order_from_cart');
            console.log('OrdersScreen: Yeni sipariş işaretçisi temizlendi');
          }
        } catch (error) {
          console.error('Yeni sipariş kontrolü yapılırken hata:', error);
        }
      };
      
      checkForNewOrder();
      
      return () => {
        console.log('OrdersScreen odaktan çıktı');
      };
    }, []) // items dependency kaldırıldı
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.restaurantName}>{item.restaurant}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      
      <View style={styles.orderContent}>
        <Text style={styles.itemsLabel}>{t('orders.summary')}:</Text>
        {item.items.map((orderItem, index) => (
          <Text key={index} style={styles.orderItem}>• {orderItem}</Text>
        ))}
      </View>
      
      <View style={styles.orderFooter}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: item.status === t('orders.delivered') ? '#4CAF50' : 
                            item.status === t('orders.pending') ? '#FFC107' : 
                            item.status === t('orders.preparing') ? '#2196F3' : 
                            item.status === t('orders.onTheWay') ? '#FF9800' : '#999' 
            }
          ]} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.orderTotal}>{item.total}</Text>
      </View>
      
      {item.isActive ? (
        <TouchableOpacity 
          style={[styles.reorderButton, { backgroundColor: '#FF5722' }]}
          onPress={() => {
            Alert.alert(
              t('attention'),
              t('confirm.complete.order'),
              [
                { text: t('cancel'), style: 'cancel' },
                { 
                  text: t('confirm'), 
                  onPress: () => completeOrder(item.id)
                }
              ]
            );
          }}
        >
          <Text style={styles.reorderButtonText}>{t('complete')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.reorderButton, styles.rateButton]}
            onPress={() => showRatingModal(item)}
          >
            <Text style={[styles.reorderButtonText, styles.rateButtonText]}>{t('orders.rate')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.reorderButton, styles.reorderButtonExpanded]}>
            <Text style={styles.reorderButtonText}>{t('orders.reorder')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>{t('tabs.orders')}</Text>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              {t('orders.pastOrders')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              {t('orders.activeOrders')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {activeTab === 'past' ? (
          <FlatList
            data={pastOrders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={(
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('orders.noOrdersYet')}</Text>
              </View>
            )}
            ListFooterComponent={<View style={styles.bottomSpacing} />}
          />
        ) : (
          activeOrders.length > 0 ? (
            <FlatList
              data={activeOrders}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.ordersList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View style={styles.bottomSpacing} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('orders.noActiveOrders')}</Text>
              <TouchableOpacity 
                style={styles.orderNowButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.orderNowButtonText}>{t('orders.orderNow')}</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab="Orders" t={t} />

      {/* Rating Modal */}
      <Modal
        visible={showRatingModalState}
        transparent={true}
        animationType="slide"
        onRequestClose={closeRatingModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Restoranı Değerlendir</Text>
            <Text style={styles.modalRestaurantName}>
              {selectedOrderForRating?.restaurant}
            </Text>
            
            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.star}
                >
                  <Text style={[
                    styles.starText,
                    rating >= star ? styles.starActive : styles.starInactive
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Yorumunuzu yazın (opsiyonel)"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeRatingModal}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitRating}
              >
                <Text style={styles.submitButtonText}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'white',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#00B2FF',
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  ordersList: {
    paddingTop: 15,
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderContent: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  orderItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  reorderButton: {
    backgroundColor: '#00B2FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  orderNowButton: {
    backgroundColor: '#00B2FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  orderNowButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rateButton: {
    backgroundColor: '#FFFFFF',
    flex: 0.6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rateButtonText: {
    color: '#666',
  },
  reorderButtonExpanded: {
    flex: 1.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalRestaurantName: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 5,
  },
  starText: {
    fontSize: 30,
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: '#DDD',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#00B2FF',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 