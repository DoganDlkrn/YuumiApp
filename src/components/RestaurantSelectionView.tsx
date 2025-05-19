import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator
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
    const topItems = item.items.slice(0, 3);
    
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => onViewRestaurant(item.id)}
      >
        <View style={styles.restaurantHeader}>
          <Image
            source={{ uri: item.image || item.logoUrl || 'https://via.placeholder.com/100' }}
            style={styles.restaurantImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.restaurantNameSection}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.name || item.isim || 'Restaurant'}
          </Text>
          <Text style={styles.restaurantCategory} numberOfLines={1}>
            {item.category || item.kategori || 'Various'}
          </Text>
        </View>
        
        <View style={styles.restaurantDetails}>
          <Text style={styles.restaurantHours} numberOfLines={1}>
            {item.calismaSaatleri || item.calismaSaatleri1 || "12:00 - 22:00"}
          </Text>
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            {item.address || item.adres || 'Address not available'}
          </Text>
        </View>
        
        <View style={styles.restaurantMetaRow}>
          <View style={styles.restaurantRating}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingText}>
              {item.rating || item.puan || '4.5'} 
              <Text style={styles.ratingCount}>({item.reviewCount || '0'})</Text>
            </Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTime}>
              {item.deliveryTime || item.teslimatSuresi || '25-40 dk'}
            </Text>
            <Text style={styles.deliveryFee}>{t('free.delivery')}</Text>
          </View>
        </View>
        
        {topItems.length > 0 && (
          <View style={styles.quickAddSection}>
            {topItems.map(menuItem => (
              <TouchableOpacity
                key={menuItem.id}
                style={styles.quickAddBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  onAddToCart(item.id, menuItem.id);
                }}
              >
                <Text style={styles.quickAddBtnText} numberOfLines={1}>
                  {(menuItem.name || menuItem.isim || '').substring(0, 20)}
                  {(menuItem.name || menuItem.isim || '').length > 20 ? '...' : ''} {t('add')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>← {t('back')}</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedDay} - {selectedDate}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {t('planning.for')} {selectedTime}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <Text style={styles.completeButtonText}>{t('complete')}</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.restaurantList}
        showsVerticalScrollIndicator={false}
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
  restaurantList: {
    padding: 10,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantHeader: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantNameSection: {
    marginBottom: 6,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restaurantCategory: {
    fontSize: 12,
    color: '#666',
  },
  restaurantDetails: {
    marginBottom: 6,
  },
  restaurantHours: {
    fontSize: 12,
    color: '#666',
  },
  restaurantAddress: {
    fontSize: 12,
    color: '#666',
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 12,
    marginRight: 5,
  },
  deliveryFee: {
    fontSize: 12,
    color: '#4CAF50',
  },
  quickAddSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  quickAddBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
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