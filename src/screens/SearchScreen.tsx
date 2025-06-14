/*
 * ARAMA EKRANI (SearchScreen)
 * 
 * Bu ekran uygulamada arama işlevlerini yönetir:
 * 
 * Ana Özellikler:
 * 1. ARAMA SİSTEMİ:
 *    - Gerçek zamanlı arama (yazarken anlık sonuç)
 *    - Kategori ve restoran bazlı filtreleme
 *    - Firestore'dan restoran verilerini çekme
 * 
 * 2. SON ARAMALAR:
 *    - AsyncStorage ile geçmiş aramaları kaydetme
 *    - Hızlı erişim için son 5 aramayı gösterme
 *    - Otomatik temizleme ve güncelleme
 * 
 * 3. KATEGORİ ÖNERİLERİ:
 *    - Önceden tanımlanmış popüler kategoriler
 *    - Horizontal scroll ile kolay gezinme
 *    - Kategori seçiminde otomatik arama
 * 
 * 4. SONUÇ YÖNETİMİ:
 *    - Kategori + Restoran karışık sonuçlar
 *    - Kategori seçiminde filtreleme
 *    - Restoran seçiminde MenuSelection'a yönlendirme
 * 
 * Veri Akışı:
 * - searchText: Anlık arama metni
 * - searchResults: Filtrelenmiş sonuçlar listesi  
 * - recentSearches: Kaydedilmiş geçmiş aramalar
 * - restaurants: Firestore'dan gelen tüm restoranlar
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp, RouteProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { useLanguage } from "../context/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Restaurant, getAllRestaurants } from "../services/RestaurantService";
import BottomTabBar from '../components/BottomTabBar';

// Import images
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');

// Constant for AsyncStorage key
const RECENT_SEARCHES_KEY = '@yuumi_recent_searches';

type SearchScreenNavProp = StackNavigationProp<RootStackParamList, "Search">;
type SearchScreenRouteProp = RouteProp<RootStackParamList, "Search">;

type SearchResultItem = {
  id: string;
  name: string;
  type: 'category' | 'restaurant';
  data?: Restaurant;
};

export default function SearchScreen() {
  const navigation = useNavigation() as SearchScreenNavProp;
  const route = useRoute<SearchScreenRouteProp>();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();
  
  // Memoize categories to prevent recreation on every render
  const categories = useMemo(() => [
    'Pizza',
    'Burger',
    'Kebap',
    'Tatlı',
    'İçecek',
    'Kahvaltı',
    'Türk',
    'Çin',
    'İtalyan',
    'Fast Food',
    'Sağlıklı',
    'Vegan'
  ], []);

  // Load saved recent searches from AsyncStorage on component mount
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const savedRecentSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (savedRecentSearches) {
          setRecentSearches(JSON.parse(savedRecentSearches));
        }
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    };

    loadRecentSearches();
  }, []);

  // Fetch restaurants from Firestore
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const restaurantsData = await getAllRestaurants();
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  // Route'dan kategori filtresi parametresini kontrol et
  useEffect(() => {
    if (route.params?.categoryFilter) {
      setSearchText(route.params.categoryFilter);
    }
  }, [route.params?.categoryFilter]);

  // Update search results when search text changes
  useEffect(() => {
    if (searchText.trim() !== "") {
      const query = searchText.toLowerCase();
      
      // Filter categories
      const categoryResults = categories
        .filter(category => category.toLowerCase().includes(query))
        .map((category, index) => ({
          id: `category-${index}`,
          name: category,
          type: 'category' as const
        }));
      
      // Filter restaurants
      const restaurantResults = restaurants
        .filter(restaurant => 
          restaurant.isim.toLowerCase().includes(query) || 
          restaurant.kategori.toLowerCase().includes(query)
        )
        .map(restaurant => ({
          id: restaurant.id,
          name: restaurant.isim,
          type: 'restaurant' as const,
          data: restaurant
        }));
      
      // Combine results - Categories first (limited to 3), then restaurants
      const combinedResults = [
        ...categoryResults.slice(0, 3),
        ...restaurantResults
      ];
      
      setSearchResults(combinedResults);
    } else {
      setSearchResults([]);
    }
  }, [searchText, restaurants, categories]);

  // Save a search term to recent searches
  const saveToRecentSearches = async (term: string) => {
    if (!term.trim()) return;

    try {
      // Remove duplicate if exists and add to the beginning
      const updatedRecentSearches = [
        term,
        ...recentSearches.filter(search => search !== term).slice(0, 4)
      ];
      
      setRecentSearches(updatedRecentSearches);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY, 
        JSON.stringify(updatedRecentSearches)
      );
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      saveToRecentSearches(searchText);
    }
  };

  const handleSearchItemPress = (item: SearchResultItem) => {
    // Add to recent searches
    saveToRecentSearches(item.name);
    
    // Navigate based on type
    if (item.type === 'category') {
      console.log(`Navigating to category: ${item.name}`);
      // Kategori seçildiğinde, kategori adını arama metni olarak ayarla
      setSearchText(item.name);
      // Burada direkt olarak bir ekrana yönlendirme yapmak yerine
      // arama metnini değiştirerek ilgili kategorideki restoranların listelenmesini sağlıyoruz
    } else if (item.type === 'restaurant' && item.data) {
      console.log(`Navigating to restaurant: ${item.name}`);
      // Restoran seçildiğinde, restoran detay sayfasına yönlendir
      navigation.navigate('MenuSelection', { 
        orderType: 'daily',
        restaurantId: item.data.id
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>{t('tabs.search')}</Text>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Image source={searchIcon} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search.placeholder')}
              placeholderTextColor="#777"
              value={searchText}
              onChangeText={handleSearch}
              onSubmitEditing={handleSearchSubmit}
              autoFocus={true}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchText("")}
                activeOpacity={1.0}
              >
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00B2FF" />
          </View>
        ) : (
          <ScrollView style={styles.contentContainer} bounces={true} showsVerticalScrollIndicator={false}>
            {searchText.length === 0 ? (
              <>
                {/* Recent Searches */}
                <View style={styles.recentSearchesSection}>
                  <Text style={styles.sectionTitle}>{t('search.recentSearches')}</Text>
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.recentSearchItem}
                        activeOpacity={1.0}
                        onPress={() => setSearchText(search)}
                      >
                        <Image source={searchIcon} style={styles.smallSearchIcon} />
                        <Text style={styles.recentSearchText}>{search}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noResultsText}>{t('search.noRecentSearches') || 'Henüz arama yapmadınız'}</Text>
                  )}
                </View>
                
                {/* Popular Categories */}
                <View style={styles.categoriesContainer}>
                  <Text style={styles.sectionTitle}>Kategoriler</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScrollView}
                    contentContainerStyle={styles.categoriesScrollContent}
                  >
                    {['Pizza', 'Burger', 'Kebap', 'Tatlı', 'İçecek', 'Kahvaltı', 'Türk', 'Çin', 'İtalyan', 'Fast Food', 'Sağlıklı', 'Vegan', 'Çiğ Köfte'].map((category, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.categoryPill}
                        activeOpacity={1.0}
                        onPress={() => {
                          setSearchText(category);
                          saveToRecentSearches(category);
                        }}
                      >
                        <Text style={styles.categoryPillText}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            ) : (
              // Search Results
              <View style={styles.searchResultsSection}>
                <Text style={styles.sectionTitle}>{t('search.results')}</Text>
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <TouchableOpacity 
                      key={`${result.type}-${result.id}`} 
                      style={styles.searchResultItem}
                      activeOpacity={1.0}
                      onPress={() => handleSearchItemPress(result)}
                    >
                      <View style={styles.searchResultContent}>
                        <Image 
                          source={result.type === 'category' ? searchIcon : restaurantIcon} 
                          style={styles.resultTypeIcon} 
                        />
                        <View style={styles.resultTextContainer}>
                          <Text style={styles.searchResultText}>{result.name}</Text>
                          {result.type === 'restaurant' && result.data && (
                            <Text style={styles.searchResultSubText}>{result.data.kategori}</Text>
                          )}
                        </View>
                      </View>
                      {result.type === 'category' && (
                        <View style={styles.resultTypeBadge}>
                          <Text style={styles.resultTypeBadgeText}>{t('search.category') || 'Kategori'}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.sadFaceEmoji}>😢</Text>
                    <Text style={styles.noResultsText}>{t('search.notFound') || 'Aradığın ürünü bulamadık'}</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab="Search" t={t} />
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
    marginBottom: 10,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 44,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#666',
  },
  smallSearchIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
    tintColor: '#666',
  },
  resultTypeIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    tintColor: '#666',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    fontSize: 18,
    color: '#999',
    padding: 5,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 15,
    width: '100%',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentSearchesSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSearchText: {
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoriesScrollView: {
    marginBottom: 10,
  },
  categoriesScrollContent: {
    paddingVertical: 5,
    paddingRight: 10,
  },
  categoryPill: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchResultsSection: {
    paddingHorizontal: 16,
  },
  searchResultItem: {
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultTextContainer: {
    flex: 1,
  },
  searchResultText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  searchResultSubText: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  resultTypeBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultTypeBadgeText: {
    fontSize: 12,
    color: '#666',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  sadFaceEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  // Restaurant styles
  allRestaurantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  restaurantCard: {
    width: '48%',
    marginBottom: 15,
  },
  restaurantImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  restaurantCardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  restaurantImageFallback: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B2FF',
  },
  restaurantImageFallbackText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  restaurantCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  restaurantCardCategory: {
    fontSize: 14,
    color: '#777',
  }
}); 