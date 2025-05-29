/*
 * RESTORAN SEÇİM VE DETAY GÖRÜNTÜLEMESİ KOMPONENTİ
 * 
 * Bu komponent iki ana görünüm modunu destekler:
 * 
 * 1. RESTORAN LİSTE GÖRÜNÜMÜ:
 *    - Mevcut restoranları kart formatında listeler
 *    - Her kart: restoran bilgileri + hızlı ürün ekleme
 *    - Kategori filtreleme özellikleri
 *    - Gerçek zamanlı sepet sayacı ve toplam fiyat
 * 
 * 2. RESTORAN DETAY GÖRÜNÜMÜ:
 *    - Seçilen restoranın tam detayları
 *    - 3 tab: Menü, Yorumlar, Bilgiler
 *    - Detaylı menü listesi ve ürün ekleme
 *    - Restoran hakkında kapsamlı bilgiler
 * 
 * Sepet Entegrasyonu:
 * - onAddToCart: Sepete ürün ekleme
 * - onRemoveFromCart: Sepetten ürün çıkarma  
 * - getCurrentItemQuantity: Anlık ürün miktarı
 * - Floating cart button: Sepet durumu görüntüleme
 * 
 * Haftalık Plan Desteği:
 * - isWeeklyPlan: Haftalık plan modu kontrolü
 * - planInfo: Plan bilgilerini ürünlerle ilişkilendirir
 * - onContinue: Plan devam etme işlevi
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface Restaurant {
  id: string;
  name?: string;
  isim?: string;
  image?: string;
  logoUrl?: string;
  category?: string;
  kategori?: string;
  calismaSaatleri?: string;
  calismaSaatleri1?: string;
  address?: string;
  adres?: string;
  rating?: string;
  puan?: string;
  reviewCount?: string;
  deliveryTime?: string;
  teslimatSuresi?: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name?: string;
  isim?: string;
  price?: number;
  fiyat?: number;
}

interface RestaurantSelectionProps {
  restaurants: Restaurant[];
  onClose: () => void;
  onComplete: () => void;
  onAddToCart: (restaurantId: string, itemId: string) => Promise<boolean>;
  onRemoveFromCart?: (restaurantId: string, itemId: string) => Promise<boolean>;
  onViewRestaurant: (restaurantId: string) => void;
  loading: boolean;
  selectedDay: string;
  selectedDate: string;
  selectedTime: string;
  cartItemCount: number;
  cartTotal: number;
  goToCart: () => void;
  isWeeklyPlan?: boolean;
  getCurrentItemQuantity?: (itemId: string) => number;
  onContinue?: () => void;
  showRestaurantDetail?: {
    restaurant: Restaurant;
    activeTab: 'menu' | 'reviews' | 'info';
    onTabChange: (tab: 'menu' | 'reviews' | 'info') => void;
    onBackToList: () => void;
  };
}

const RestaurantSelectionView: React.FC<RestaurantSelectionProps> = ({
  restaurants,
  onClose,
  onComplete,
  onAddToCart,
  onRemoveFromCart,
  onViewRestaurant,
  loading,
  selectedDay,
  selectedDate,
  selectedTime,
  cartItemCount,
  cartTotal,
  goToCart,
  isWeeklyPlan,
  getCurrentItemQuantity,
  onContinue,
  showRestaurantDetail
}) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B2FF" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => {
    const topItems = item.items && item.items.length > 0 ? item.items.slice(0, 3) : [];
    
    return (
      <TouchableOpacity
        style={styles.restaurantItem}
        onPress={() => onViewRestaurant(item.id)}
        activeOpacity={1.0}
      >
        {/* Restaurant Image */}
        <View style={styles.restaurantImagePlaceholder}>
          {item.logoUrl || item.image ? (
            <Image
              source={{ uri: item.logoUrl || item.image }}
              style={styles.restaurantImage}
            />
          ) : (
            <View style={styles.restaurantImageFallback}>
              <Text style={styles.restaurantImageFallbackText}>
                {(item.name || item.isim || 'R').charAt(0)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.name || item.isim || 'Restaurant'}
          </Text>
          <Text style={styles.restaurantCategory} numberOfLines={1}>
            {item.category || item.kategori || 'Çeşitli'}
          </Text>
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            {item.address || item.adres || 'Adres bilgisi yok'}
          </Text>
          
          <View style={styles.restaurantMetaRow}>
            <View style={styles.restaurantRating}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingText}>
                {item.rating || item.puan || '4.5'}
              </Text>
              <Text style={styles.ratingCount}>({item.reviewCount || '0'})</Text>
            </View>
            <Text style={styles.deliveryTime}>
              {item.deliveryTime || item.teslimatSuresi || '25-40 dk'}
            </Text>
          </View>
          
          {/* Quick Add Items */}
          {topItems.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.quickAddRow}
              nestedScrollEnabled={true}
            >
              {topItems.map(menuItem => {
                const quantity = getCurrentItemQuantity ? getCurrentItemQuantity(menuItem.id) : 0;
                
                return (
                  <View key={menuItem.id} style={styles.quickAddContainer}>
                    <Text style={styles.quickAddItemName} numberOfLines={1}>
                      {(menuItem.name || menuItem.isim || '').substring(0, 15)}
                      {(menuItem.name || menuItem.isim || '').length > 15 ? '...' : ''}
                    </Text>
                    
                    <View style={styles.quantityControlsSmall}>
                      {quantity > 0 ? (
                        <>
                          <TouchableOpacity 
                            style={styles.quantityButtonSmall}
                            onPress={async () => {
                              try {
                                if (onRemoveFromCart) {
                                  await onRemoveFromCart(item.id, menuItem.id);
                              }
                            } catch (error) {
                              console.error(`Error decreasing quantity:`, error);
                            }
                          }}
                        >
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButtonSmall}
                          onPress={async () => {
                            try {
                              await onAddToCart(item.id, menuItem.id);
                            } catch (error) {
                              console.error(`Error adding item:`, error);
                            }
                          }}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity 
                        style={styles.addButtonSmall}
                        onPress={async () => {
                          try {
                            await onAddToCart(item.id, menuItem.id);
                          } catch (error) {
                            console.error(`Error adding item:`, error);
                          }
                        }}
                      >
                        <Text style={styles.addButtonText}>+ Ekle</Text>
                      </TouchableOpacity>
                    )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Restaurant Detail View
  if (showRestaurantDetail) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: '#fff' }]}>
          <TouchableOpacity style={styles.backButton} onPress={showRestaurantDetail.onBackToList}>
            <Text style={[styles.backButtonText, { color: '#00B2FF' }]}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: '#333' }]} numberOfLines={1}>
              {showRestaurantDetail.restaurant.name || showRestaurantDetail.restaurant.isim}
            </Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.headerCategoryText}>
                {showRestaurantDetail.restaurant.category || showRestaurantDetail.restaurant.kategori || 'Çeşitli'}
              </Text>
            </View>
          </View>
        </View>

        {/* Restaurant Tabs */}
        <View style={styles.restaurantTabs}>
          <TouchableOpacity 
            style={[styles.restaurantTab, showRestaurantDetail.activeTab === 'menu' && styles.activeTab]}
            onPress={() => showRestaurantDetail.onTabChange('menu')}
          >
            <Text style={[styles.restaurantTabText, showRestaurantDetail.activeTab === 'menu' && styles.activeTabText]}>
              Menü
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.restaurantTab, showRestaurantDetail.activeTab === 'reviews' && styles.activeTab]}
            onPress={() => showRestaurantDetail.onTabChange('reviews')}
          >
            <Text style={[styles.restaurantTabText, showRestaurantDetail.activeTab === 'reviews' && styles.activeTabText]}>
              Yorumlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.restaurantTab, showRestaurantDetail.activeTab === 'info' && styles.activeTab]}
            onPress={() => showRestaurantDetail.onTabChange('info')}
          >
            <Text style={[styles.restaurantTabText, showRestaurantDetail.activeTab === 'info' && styles.activeTabText]}>
              Bilgiler
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {showRestaurantDetail.activeTab === 'menu' && (
            <>
              {(showRestaurantDetail.restaurant.items || []).length > 0 ? (
                <FlatList
                  data={showRestaurantDetail.restaurant.items || []}
                  renderItem={({ item }) => {
                    const quantity = getCurrentItemQuantity ? getCurrentItemQuantity(item.id) : 0;
                    
                    return (
                      <View style={styles.menuItem}>
                        <View style={styles.menuItemLeftSection}>
                          <Text style={styles.menuItemName}>{item.name || item.isim}</Text>
                        </View>
                        <View style={styles.menuItemPriceRow}>
                          <Text style={styles.menuItemPrice}>
                            ₺{(item.price || item.fiyat || 0).toFixed ? (item.price || item.fiyat).toFixed(2) : (item.price || item.fiyat)}
                          </Text>
                        </View>
                        <View style={styles.addToCartRow}>
                          <View style={styles.quantityControlsContainer}>
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={async () => {
                                try {
                                  if (onRemoveFromCart && quantity > 0) {
                                    await onRemoveFromCart(showRestaurantDetail.restaurant.id, item.id);
                                  }
                                } catch (error) {
                                  console.error('Error decreasing quantity:', error);
                                }
                              }}
                            >
                              <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            
                            <View style={styles.quantityTextContainer}>
                              <Text style={styles.quantityText}>{quantity}</Text>
                            </View>
                            
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => onAddToCart(showRestaurantDetail.restaurant.id, item.id)}
                            >
                              <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.noMenuContainer}>
                  <Text style={styles.noMenuText}>Bu restoran için menü bilgisi bulunmamaktadır.</Text>
                </View>
              )}
            </>
          )}

          {showRestaurantDetail.activeTab === 'reviews' && (
            <View style={styles.reviewsTab}>
              <Text style={styles.tabPlaceholder}>Yorumlar yakında...</Text>
            </View>
          )}

          {showRestaurantDetail.activeTab === 'info' && (
            <View style={styles.infoTab}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Adres:</Text>
                <Text style={styles.infoValue}>
                  {showRestaurantDetail.restaurant.address || showRestaurantDetail.restaurant.adres || 'Bilgi yok'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Çalışma Saatleri:</Text>
                <Text style={styles.infoValue}>
                  {showRestaurantDetail.restaurant.calismaSaatleri || showRestaurantDetail.restaurant.calismaSaatleri1 || '12:00 - 22:00'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Puan:</Text>
                <Text style={styles.infoValue}>
                  ★ {showRestaurantDetail.restaurant.rating || showRestaurantDetail.restaurant.puan || '4.5'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Floating Action Buttons for Restaurant Detail */}
        {cartItemCount > 0 && (
          <View style={styles.floatingButtonsContainer}>
            {isWeeklyPlan && onContinue && (
              <TouchableOpacity style={[styles.cartFloatingButton, styles.continueButton]} onPress={onContinue}>
                <Text style={styles.cartBtnLabel}>Devam Et</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={[styles.cartFloatingButton, isWeeklyPlan && styles.halfWidthButton]} onPress={goToCart}>
              <Text style={styles.cartBtnLabel}>
                Sepete Git ({cartItemCount}) • ₺{cartTotal.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* White Content Container with integrated header */}
      <View style={styles.whiteContainer}>
        {/* White Header Bar */}
        <View style={styles.whiteHeader}>
          <TouchableOpacity style={styles.whiteBackButton} onPress={onClose}>
            <Text style={styles.whiteBackButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.whiteHeaderContent}>
            <Text style={styles.whiteHeaderTitle} numberOfLines={1}>
              {selectedDay} - {selectedDate}
            </Text>
            <Text style={styles.whiteHeaderSubtitle} numberOfLines={1}>
              {t('planning.for')} {selectedTime}
            </Text>
          </View>

          <View style={styles.whiteHeaderRightButtons}>
            <TouchableOpacity style={styles.whiteCompleteButton} onPress={onComplete}>
              <Text style={styles.whiteCompleteButtonText}>{t('complete')}</Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* Popular Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>Popüler Kategoriler</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
          nestedScrollEnabled={true}
        >
          {[
            { key: 'pizza', label: 'Pizza' },
            { key: 'burger', label: 'Burger' },
            { key: 'kebap', label: 'Kebap' },
            { key: 'cigkofte', label: 'Çiğ Köfte' },
            { key: 'dessert', label: 'Tatlı' },
            { key: 'drink', label: 'İçecek' }
          ].map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.categoryItem}
              activeOpacity={1.0}
            >
              <Text style={styles.categoryText}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.restaurantList}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        nestedScrollEnabled={true}
      />
      
        {cartItemCount > 0 && (
          <TouchableOpacity style={styles.cartFloatingButton} onPress={goToCart}>
            <View style={styles.cartBtnContent}>
              <Text style={styles.cartItemCount}>{cartItemCount} {t('cart.items')}</Text>
              <Text style={styles.cartBtnPrice}>₺{cartTotal.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerSection: {
    backgroundColor: '#00B2FF',
    paddingBottom: 15,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 30,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerRightButtons: {
    flexDirection: 'row',
  },
  completeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoriesScroll: {
    height: 35,
  },
  categoryItem: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryText: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
  restaurantList: {
    padding: 15,
  },
  restaurantItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  restaurantImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  restaurantImageFallback: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B2FF',
  },
  restaurantImageFallbackText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  restaurantCategory: {
    fontSize: 14,
    color: '#00B2FF',
    marginBottom: 2,
    fontWeight: '500',
  },
  restaurantAddress: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#FFC107',
    fontSize: 14,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  ratingCount: {
    fontSize: 11,
    color: '#777',
    marginLeft: 2,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  quickAddRow: {
    marginTop: 8,
  },
  quickAddContainer: {
    flexDirection: 'column',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 120,
  },
  quickAddItemName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  quantityControlsSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quantityButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
    color: '#333',
  },
  headerCategoryText: {
    color: '#00B2FF',
    fontSize: 14,
    fontWeight: '500',
  },
  addButtonSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#00B2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonTextLarge: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  // Restaurant Detail Styles
  restaurantTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  restaurantTab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#00B2FF',
  },
  restaurantTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: '#00B2FF',
  },
  tabContent: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeftSection: {
    flex: 1,
    marginBottom: 5,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemPriceRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#00B2FF',
    fontWeight: '500',
  },
  addToCartRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 3,
    justifyContent: 'space-between',
  },
  quantityTextContainer: {
    minWidth: 30,
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  noMenuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMenuText: {
    fontSize: 16,
    color: '#666',
  },
  reviewsTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabPlaceholder: {
    fontSize: 16,
    color: '#666',
  },
  infoTab: {
    padding: 15,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  floatingButtonsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#28a745',
  },
  halfWidthButton: {
    flex: 1,
  },
  cartFloatingButton: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: '#00B2FF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cartBtnContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cartItemCount: {
    color: '#fff',
    marginRight: 10,
    fontSize: 14,
  },
  cartBtnPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cartBtnLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // White Header Styles
  whiteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  whiteBackButton: {
    padding: 8,
    marginRight: 5,
  },
  whiteBackButtonText: {
    fontSize: 20,
    color: '#00B2FF',
    fontWeight: 'bold',
  },
  whiteHeaderContent: {
    flex: 1,
    marginLeft: 5,
    justifyContent: 'center',
  },
  whiteHeaderTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  whiteHeaderSubtitle: {
    fontSize: 13,
    color: '#00B2FF',
    marginTop: 1,
  },
  whiteHeaderRightButtons: {
    flexDirection: 'row',
  },
  whiteCompleteButton: {
    backgroundColor: '#00B2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  whiteCompleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RestaurantSelectionView; 