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
  ImageSourcePropType
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";

// Import images
const searchIcon: ImageSourcePropType = require('../assets/search-interface-symbol.png');
const restaurantIcon: ImageSourcePropType = require('../assets/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/order.png');
const userIcon: ImageSourcePropType = require('../assets/user.png');

type SearchScreenNavProp = StackNavigationProp<RootStackParamList, "Search">;

export default function SearchScreen() {
  const navigation = useNavigation() as SearchScreenNavProp;
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Pizza",
    "Burger",
    "Kebap",
    "Lahmacun",
    "Dürüm",
  ]);

  useEffect(() => {
    // Simulate search results
    if (searchText.trim() !== "") {
      const results = ["Pizza", "Burger", "Kebap", "Tatlı", "İçecek", "Kahvaltı"]
        .filter(item => item.toLowerCase().includes(searchText.toLowerCase()));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Arama</Text>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Image source={searchIcon} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Restoran veya yemek ara..."
              placeholderTextColor="#777"
              value={searchText}
              onChangeText={handleSearch}
              autoFocus={true}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        <ScrollView style={styles.contentContainer} bounces={true} showsVerticalScrollIndicator={false}>
          {searchText.length === 0 ? (
            <>
              {/* Recent Searches */}
              <View style={styles.recentSearchesSection}>
                <Text style={styles.sectionTitle}>Son Aramalar</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.recentSearchItem}
                    onPress={() => setSearchText(search)}
                  >
                    <Image source={searchIcon} style={styles.smallSearchIcon} />
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Popular Categories */}
              <View style={styles.categoriesContainer}>
                <Text style={styles.sectionTitle}>Popüler Kategoriler</Text>
                <View style={styles.categoriesGrid}>
                  {['Pizza', 'Burger', 'Kebap', 'Tatlı', 'İçecek', 'Kahvaltı'].map((category, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.categoryCard}
                      onPress={() => setSearchText(category)}
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
              <Text style={styles.sectionTitle}>Arama Sonuçları</Text>
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.searchResultItem}
                    onPress={() => {
                      // Add to recent searches if not already included
                      if (!recentSearches.includes(result)) {
                        setRecentSearches(prev => [result, ...prev.slice(0, 4)]);
                      }
                      // Navigate to result
                      console.log(`Navigating to ${result}`);
                    }}
                  >
                    <Text style={styles.searchResultText}>{result}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>Sonuç bulunamadı</Text>
              )}
            </View>
          )}
          
          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Image source={restaurantIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Yemek</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <Image source={searchIcon} style={[styles.tabIcon, styles.activeTabIcon]} />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Arama</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Orders')}
        >
          <Image source={orderIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Siparişlerim</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image source={userIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Profilim</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
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