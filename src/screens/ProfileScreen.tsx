import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView
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
const editIcon = require('../assets/user.png');

type ProfileScreenNavProp = StackNavigationProp<RootStackParamList, "Profile">;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavProp>();

  const settingsSections = [
    {
      title: 'Hesap',
      items: [
        { icon: userIcon, title: 'Profil Bilgileri', screen: 'EditProfile' },
        { icon: userIcon, title: 'Adreslerim', screen: 'Addresses' },
        { icon: userIcon, title: 'Ödeme Yöntemlerim', screen: 'PaymentMethods' },
      ]
    },
    {
      title: 'Tercihler',
      items: [
        { icon: userIcon, title: 'Bildirim Ayarları', screen: 'Notifications' },
        { icon: userIcon, title: 'Dil Seçenekleri', screen: 'Language' },
        { icon: userIcon, title: 'Tema Seçenekleri', screen: 'Theme' },
      ]
    },
    {
      title: 'Diğer',
      items: [
        { icon: userIcon, title: 'Hakkımızda', screen: 'About' },
        { icon: userIcon, title: 'Yardım & Destek', screen: 'Support' },
        { icon: userIcon, title: 'Çıkış Yap', screen: 'Logout', isLogout: true },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B2FF" />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Profilim</Text>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Summary */}
          <View style={styles.profileSummary}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>D</Text>
              </View>
              <TouchableOpacity style={styles.editImageButton}>
                <Image source={editIcon} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Doğan Dalkıran</Text>
              <Text style={styles.profileEmail}>dogandalkiran@gmail.com</Text>
              <Text style={styles.profilePhone}>+90 555 123 45 67</Text>
            </View>
          </View>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              
              <View style={styles.settingsItemsContainer}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex} 
                    style={[
                      styles.settingsItem,
                      item.isLogout && styles.logoutItem
                    ]}
                    onPress={() => {
                      if (item.screen === 'Logout') {
                        // Handle logout
                        navigation.navigate('Login');
                      } else {
                        console.log(`Navigate to ${item.screen}`);
                      }
                    }}
                  >
                    <View style={styles.settingsItemContent}>
                      <View style={[
                        styles.settingsItemIconContainer,
                        item.isLogout && styles.logoutIconContainer
                      ]}>
                        <Image 
                          source={item.icon} 
                          style={[
                            styles.settingsItemIcon,
                            item.isLogout && styles.logoutIcon
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.settingsItemTitle,
                        item.isLogout && styles.logoutText
                      ]}>
                        {item.title}
                      </Text>
                    </View>
                    
                    {!item.isLogout && (
                      <Text style={styles.settingsItemArrow}>›</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Yuumi v1.0.0</Text>
          </View>

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
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Search')}
        >
          <Image source={searchIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Arama</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Orders')}
        >
          <Image source={orderIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Siparişlerim</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <View style={styles.iconBackground}>
            <Image source={userIcon} style={[styles.tabIcon, styles.activeTabIcon]} />
          </View>
          <View style={styles.bubbleIndicator}>
            <View style={styles.bubbleInner} />
          </View>
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Profilim</Text>
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
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 15,
  },
  profileSummary: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 15,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  editIcon: {
    width: 14,
    height: 14,
    tintColor: '#00B2FF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
  },
  settingsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
    marginBottom: 10,
  },
  settingsItemsContainer: {
    backgroundColor: 'white',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical:
    12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutIconContainer: {
    backgroundColor: '#ffebee',
  },
  settingsItemIcon: {
    width: 20,
    height: 20,
    tintColor: '#555',
  },
  logoutIcon: {
    tintColor: '#f44336',
  },
  settingsItemTitle: {
    fontSize: 15,
    color: '#333',
  },
  logoutText: {
    color: '#f44336',
    fontWeight: '500',
  },
  settingsItemArrow: {
    fontSize: 20,
    color: '#aaa',
  },
  logoutItem: {
    marginTop: 5,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 13,
    color: '#999',
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