import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { useLanguage } from "../context/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Restaurant, getAllRestaurants } from "../services/RestaurantService";

// Import images
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');

// Constant for AsyncStorage key
const RECENT_SEARCHES_KEY = '@yuumi_recent_searches';

type SearchScreenNavProp = StackNavigationProp<RootStackParamList, "Search">;

type SearchResultItem = {
  id: string;
  name: string;
  type: 'category' | 'restaurant';
  data?: Restaurant;
};

export default function SearchScreen() {
  const navigation = useNavigation() as SearchScreenNavProp;
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();
  
  // Categories should be localized depending on language
  const categories = [
    t('category.pizza'),
    t('category.burger'),
    t('category.kebap'),
    t('category.dessert'),
    t('category.drinks'),
    t('category.breakfast')
  ];

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
  }, [searchText, categories, restaurants]);

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
      // Navigate to category screen or filter results
    } else if (item.type === 'restaurant' && item.data) {
      console.log(`Navigating to restaurant: ${item.name}`);
      // Navigate to restaurant details
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
                  <Text style={styles.sectionTitle}>{t('search.popularCategories')}</Text>
                  <View style={styles.categoriesGrid}>
                    {categories.map((category, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.categoryCard}
                        activeOpacity={1.0}
                        onPress={() => {
                          setSearchText(category);
                          saveToRecentSearches(category);
                        }}
                      >
                        <Text style={styles.categoryText}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
          style={[styles.tabItem, styles.activeTabItem]}
          activeOpacity={1.0}
        >
          <Image source={searchIcon} style={[styles.tabIcon, styles.activeTabIcon]} />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>{t('tabs.search')}</Text>
          <View style={styles.activeIndicator} />
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
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTabItem: {
    position: 'relative',
  },
  tabIcon: {
    width: 24,
    height: 24,
    tintColor: '#777',
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: '#777',
  },
  activeTabIcon: {
    tintColor: '#00B2FF',
  },
  activeTabLabel: {
    color: '#00B2FF',
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 40,
    height: 3,
    backgroundColor: '#00B2FF',
    alignSelf: 'center',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
}); 