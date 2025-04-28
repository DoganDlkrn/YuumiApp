import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageSourcePropType,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Import images
const searchIcon: ImageSourcePropType = require('../assets/search-interface-symbol.png');
const restaurantIcon: ImageSourcePropType = require('../assets/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/order.png');
const userIcon: ImageSourcePropType = require('../assets/user.png');

type ProfileScreenNavProp = StackNavigationProp<RootStackParamList, "Profile">;

export default function ProfileScreen() {
  const navigation = useNavigation() as ProfileScreenNavProp;
  const { user, profile, logout } = useAuth();
  const { theme } = useTheme();
  
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  const settingsSections = [
    {
      title: 'Hesap',
      items: [
        { title: 'Profil Bilgileri', screen: 'EditProfile' },
        { title: 'Adreslerim', screen: 'Addresses' },
        { title: 'Ödeme Yöntemlerim', screen: 'PaymentMethods' },
      ]
    },
    {
      title: 'Tercihler',
      items: [
        { title: 'Bildirim Ayarları', screen: 'Notifications' },
        { title: 'Dil Seçenekleri', screen: 'Language' },
      ]
    },
    {
      title: 'Diğer',
      items: [
        { title: 'Yardım & Destek', screen: 'Support' },
        { title: 'Çıkış Yap', screen: 'Logout', isLogout: true },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login' as never);
    } catch (error) {
      console.log('Çıkış yapılırken hata oluştu:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme === 'dark' ? "#1e88e5" : "#00B2FF"} />

      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Profilim</Text>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Summary */}
          <View style={styles.profileSummary}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.displayName || 'İsimsiz Kullanıcı'}</Text>
              <Text style={styles.profileEmail}>{profile?.email || user?.email || 'E-posta yok'}</Text>
              <Text style={styles.profilePhone}>{profile?.phoneNumber || 'Telefon yok'}</Text>
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
                        Alert.alert(
                          'Çıkış Yap',
                          'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
                          [
                            {
                              text: 'İptal',
                              style: 'cancel'
                            },
                            {
                              text: 'Çıkış Yap',
                              onPress: handleLogout
                            }
                          ]
                        );
                      } else {
                        console.log(`Navigate to ${item.screen}`);
                      }
                    }}
                  >
                    <Text style={[
                      styles.settingsItemTitle,
                      item.isLogout && styles.logoutText
                    ]}>
                      {item.title}
                    </Text>
                    
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
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Image source={restaurantIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Yemek</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Search' as never)}
        >
          <Image source={searchIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Arama</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Orders' as never)}
        >
          <Image source={orderIcon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>Siparişlerim</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <Image source={userIcon} style={[styles.tabIcon, styles.activeTabIcon]} />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Profilim</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
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
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 15,
    width: '100%',
  },
  profileSummary: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: 'flex-start',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    height: Platform.OS === 'ios' ? 80 : 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    width: 22,
    height: 22,
    tintColor: '#9E9E9E',
  },
  tabLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 3,
  },
  activeTabItem: {
    backgroundColor: 'white',
  },
  activeTabIcon: {
    tintColor: '#00B2FF',
  },
  activeTabLabel: {
    color: '#00B2FF',
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

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e88e5',
  },
  headerSection: {
    backgroundColor: '#1e88e5',
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
    backgroundColor: '#121212',
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
  profileSummary: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#aaa',
  },
  settingsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 16,
    marginBottom: 10,
  },
  settingsItemsContainer: {
    backgroundColor: '#1a1a1a',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingsItemTitle: {
    fontSize: 15,
    color: '#fff',
  },
  logoutText: {
    color: '#f44336',
    fontWeight: '500',
  },
  settingsItemArrow: {
    fontSize: 20,
    color: '#777',
  },
  logoutItem: {
    marginTop: 5,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#777',
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    height: Platform.OS === 'ios' ? 80 : 60,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    width: 22,
    height: 22,
    tintColor: '#777',
  },
  tabLabel: {
    fontSize: 10,
    color: '#777',
    marginTop: 3,
  },
  activeTabItem: {
    backgroundColor: '#1a1a1a',
  },
  activeTabIcon: {
    tintColor: '#1e88e5',
  },
  activeTabLabel: {
    color: '#1e88e5',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 40,
    height: 3,
    backgroundColor: '#1e88e5',
    alignSelf: 'center',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
}); 