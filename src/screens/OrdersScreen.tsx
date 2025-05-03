import React, { useState } from "react";
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
  ImageSourcePropType
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from '../navigation/AppNavigation';
import { useLanguage } from "../context/LanguageContext";

// Import images
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');

type OrdersScreenNavProp = StackNavigationProp<RootStackParamList, "Orders">;

export default function OrdersScreen() {
  const navigation = useNavigation() as OrdersScreenNavProp;
  const [activeTab, setActiveTab] = useState<'past' | 'active'>('past');
  const { t } = useLanguage();
  
  // Mock data for orders - this could be enhanced to support translated content
  const mockOrders = [
    {
      id: '1',
      restaurant: 'Restoran A',
      date: '31 Mar 2023',
      items: ['Pizza Margherita', 'Cola'],
      status: t('orders.delivered'),
      total: '79,90 ₺'
    },
    {
      id: '2',
      restaurant: 'Restoran B',
      date: '28 Mar 2023',
      items: ['Burger Menu', 'Patates Kızartması'],
      status: t('orders.delivered'),
      total: '89,90 ₺'
    },
    {
      id: '3',
      restaurant: 'Restoran C',
      date: '25 Mar 2023',
      items: ['Kebap Porsiyon', 'Ayran'],
      status: t('orders.delivered'),
      total: '120,00 ₺'
    },
  ];

  const renderOrderItem = ({ item }: { item: typeof mockOrders[0] }) => (
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
          <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.orderTotal}>{item.total}</Text>
      </View>
      
      <TouchableOpacity style={styles.reorderButton}>
        <Text style={styles.reorderButtonText}>{t('orders.reorder')}</Text>
      </TouchableOpacity>
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
            data={mockOrders}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('orders.noActiveOrders')}</Text>
            <TouchableOpacity 
              style={styles.orderNowButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.orderNowButtonText}>{t('orders.orderNow')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Image source={restaurantIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.food')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Search')}
        >
          <Image source={searchIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{t('tabs.search')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <Image source={orderIcon} style={[styles.tabIcon, styles.activeTabIcon]} />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>{t('tabs.orders')}</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
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