import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigation';

// Import images
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');

type BottomTabBarProps = {
  activeTab: 'Home' | 'Search' | 'Orders' | 'Profile';
  t: (key: string) => string;
};

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, t }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.bottomTabBar}>
      <TouchableOpacity 
        style={styles.tabItem} 
        activeOpacity={0.7}
        onPress={() => activeTab !== 'Home' && navigation.navigate('Home' as never)}
      >
        <Image 
          source={restaurantIcon} 
          style={[styles.tabIcon, activeTab === 'Home' && styles.activeTabIcon]} 
        />
        <Text 
          style={[styles.tabLabel, activeTab === 'Home' && styles.activeTabLabel]}
        >
          {t('tabs.food')}
        </Text>
        <View style={styles.indicatorContainer}>
          {activeTab === 'Home' && <View style={styles.activeIndicator} />}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => activeTab !== 'Search' && navigation.navigate('Search' as never)}
      >
        <Image 
          source={searchIcon} 
          style={[styles.tabIcon, activeTab === 'Search' && styles.activeTabIcon]} 
        />
        <Text 
          style={[styles.tabLabel, activeTab === 'Search' && styles.activeTabLabel]}
        >
          {t('tabs.search')}
        </Text>
        <View style={styles.indicatorContainer}>
          {activeTab === 'Search' && <View style={styles.activeIndicator} />}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => activeTab !== 'Orders' && navigation.navigate('Orders' as never)}
      >
        <Image 
          source={orderIcon} 
          style={[styles.tabIcon, activeTab === 'Orders' && styles.activeTabIcon]} 
        />
        <Text 
          style={[styles.tabLabel, activeTab === 'Orders' && styles.activeTabLabel]}
        >
          {t('tabs.orders')}
        </Text>
        <View style={styles.indicatorContainer}>
          {activeTab === 'Orders' && <View style={styles.activeIndicator} />}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => activeTab !== 'Profile' && navigation.navigate('Profile' as never)}
      >
        <Image 
          source={userIcon} 
          style={[styles.tabIcon, activeTab === 'Profile' && styles.activeTabIcon]} 
        />
        <Text 
          style={[styles.tabLabel, activeTab === 'Profile' && styles.activeTabLabel]}
        >
          {t('tabs.profile')}
        </Text>
        <View style={styles.indicatorContainer}>
          {activeTab === 'Profile' && <View style={styles.activeIndicator} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    bottomTabBar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#e1e1e1',
      backgroundColor: 'white',
      height: Platform.OS === 'ios' ? 80 : 65,
      paddingBottom: Platform.OS === 'ios' ? 10 : 0,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 100,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 8,
    },
    tabIcon: {
      width: 24,
      height: 24,
      tintColor: '#888',
      marginBottom: 2,
    },
    activeTabIcon: {
      tintColor: '#00B2FF',
    },
    tabLabel: {
      fontSize: 12,
      color: '#888',
      fontWeight: '400',
      textAlign: 'center',
    },
    activeTabLabel: {
      color: '#00B2FF',
      fontWeight: '500',
    },
    indicatorContainer: {
      position: 'absolute',
      bottom: 5,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    activeIndicator: {
      width: 40,
      height: 3,
      backgroundColor: '#00B2FF',
      borderRadius: 1.5,
    },
  });
  
  export default BottomTabBar;