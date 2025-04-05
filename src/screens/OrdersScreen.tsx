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
  FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";

// Import images
const searchIcon = require('../assets/search-interface-symbol.png');
const restaurantIcon = require('../assets/restaurant.png');
const orderIcon = require('../assets/order.png');
const userIcon = require('../assets/user.png');

type OrdersScreenNavProp = StackNavigationProp<RootStackParamList, "Orders">;

// Mock data for orders
const mockOrders = [
  {
    id: '1',
    restaurant: 'Restoran A',
    date: '31 Mar 2023',
    items: ['Pizza Margherita', 'Cola'],
    status: 'Teslim edildi',
    total: '79,90 ₺'
  },
  {
    id: '2',
    restaurant: 'Restoran B',
    date: '28 Mar 2023',
    items: ['Burger Menu', 'Patates Kızartması'],
    status: 'Teslim edildi',
    total: '89,90 ₺'
  },
  {
    id: '3',
    restaurant: 'Restoran C',
    date: '25 Mar 2023',
    items: ['Kebap Porsiyon', 'Ayran'],
    status: 'Teslim edildi',
    total: '120,00 ₺'
  },
];

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavProp>();
  const [activeTab, setActiveTab] = useState<'past' | 'active'>('past');

  const renderOrderItem = ({ item }: { item: typeof mockOrders[0] }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.restaurantName}>{item.restaurant}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      
      <View style={styles.orderContent}>
        <Text style={styles.itemsLabel}>Sipariş Özeti:</Text>
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
        <Text style={styles.reorderButtonText}>Tekrar Sipariş Ver</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Siparişlerim</Text>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              Geçmiş Siparişler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Aktif Siparişler
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
                <Text style={styles.emptyText}>Henüz siparişiniz bulunmamaktadır.</Text>
              </View>
            )}
            ListFooterComponent={<View style={styles.bottomSpacing} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Şu anda aktif siparişiniz bulunmamaktadır.</Text>
            <TouchableOpacity 
              style={styles.orderNowButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.orderNowButtonText}>Hemen Sipariş Ver</Text>
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
          <Text style={styles.tabLabel}>Yemek</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Search')}
        >
          <Image source={searchIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Arama</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <View style={styles.iconBackground}>
            <Image source={orderIcon} style={[styles.tabIcon, styles.activeTabIcon]} />
          </View>
          <View style={styles.bubbleIndicator}>
            <View style={styles.bubbleInner} />
          </View>
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Siparişlerim</Text>
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
    fontWeight: 'bold',
    color: '#333',
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
    fontWeight: '600',
    marginBottom: 4,
    color: '#555',
  },
  orderItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    marginBottom: 3,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
    fontWeight: 'bold',
    color: '#333',
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
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  orderNowButton: {
    backgroundColor: '#00B2FF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  orderNowButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 85 : 70,
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
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    height: Platform.OS === 'ios' ? 75 : 60,
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
    tintColor: 'white',
  },
  activeTabLabel: {
    color: '#00B2FF',
    fontWeight: '500',
  },
  bubbleIndicator: {
    position: 'absolute',
    top: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00B2FF',
    alignSelf: 'center',
  },
  bubbleInner: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'white',
    position: 'absolute',
    top: 1.5,
    left: 1.5,
  },
  iconBackground: {
    backgroundColor: '#00B2FF',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    shadowColor: '#00B2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
}); 