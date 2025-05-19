import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView
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
  onAddToCart: (restaurantId: string, itemId: string) => void;
  onViewRestaurant: (restaurantId: string) => void;
  loading: boolean;
  selectedDay: string;
  selectedDate: string;
  selectedTime: string;
  cartItemCount: number;
  cartTotal: number;
  goToCart: () => void;
}

const RestaurantSelectionView: React.FC<RestaurantSelectionProps> = ({
  restaurants,
  onClose,
  onComplete,
  onAddToCart,
  onViewRestaurant,
  loading,
  selectedDay,
  selectedDate,
  selectedTime,
  cartItemCount,
  cartTotal,
  goToCart
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
      >
        <View style={styles.restaurantImagePlaceholder}>
          {item.logoUrl || item.image ? (
            <Image
              source={{ uri: item.logoUrl || item.image || 'https://via.placeholder.com/100' }}
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
            {item.category || item.kategori || 'Various'}
          </Text>
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            {item.address || item.adres || 'Address not available'}
          </Text>
          
          <View style={styles.restaurantMetaRow}>
            <View style={styles.restaurantRating}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingText}>
                {item.rating || item.puan || '4.5'} 
                <Text style={styles.ratingCount}>({item.reviewCount || '0'})</Text>
              </Text>
            </View>
            <Text style={styles.deliveryTime}>
              {item.deliveryTime || item.teslimatSuresi || '25-40 dk'}
            </Text>
          </View>
          
          {topItems.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.quickAddRow}
              nestedScrollEnabled={true}
            >
              {topItems.map(menuItem => (
                <TouchableOpacity
                  key={menuItem.id}
                  style={styles.quickAddBtn}
                  onPress={() => onAddToCart(item.id, menuItem.id)}
                >
                  <Text style={styles.quickAddBtnText} numberOfLines={1}>
                    {(menuItem.name || menuItem.isim || '').substring(0, 15)}
                    {(menuItem.name || menuItem.isim || '').length > 15 ? '...' : ''} +
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedDay} - {selectedDate}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {t('planning.for')} {selectedTime}
          </Text>
        </View>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
            <Text style={styles.completeButtonText}>{t('complete')}</Text>
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
          <Text style={styles.cartBtnLabel}>{t('cart.goto')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00B2FF',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#00B2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  categoriesContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryItem: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
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
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 5,
  },
  restaurantRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#FFC107',
    marginRight: 2,
  },
  ratingText: {
    fontSize: 13,
  },
  ratingCount: {
    fontSize: 11,
    color: '#777',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
  },
  quickAddRow: {
    flexDirection: 'row',
    marginTop: 5,
    height: 30,
  },
  quickAddBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
  },
  quickAddBtnText: {
    fontSize: 12,
  },
  cartFloatingButton: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: '#00B2FF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cartBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemCount: {
    color: '#fff',
    marginRight: 10,
  },
  cartBtnPrice: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartBtnLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RestaurantSelectionView; 