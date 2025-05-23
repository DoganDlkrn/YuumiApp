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
import { useLanguage } from "../context/LanguageContext";
import Svg, { G, Path } from "react-native-svg";
import { useLocation } from '../context/LocationContext';
import BottomTabBar from '../components/BottomTabBar';

// Import images
const searchIcon: ImageSourcePropType = require('../assets/images/search-interface-symbol.png');
const restaurantIcon: ImageSourcePropType = require('../assets/images/restaurant.png');
const orderIcon: ImageSourcePropType = require('../assets/images/order.png');
const userIcon: ImageSourcePropType = require('../assets/images/user.png');

type ProfileScreenNavProp = StackNavigationProp<RootStackParamList, "Profile">;

export default function ProfileScreen() {
  const navigation = useNavigation() as ProfileScreenNavProp;
  const { user, profile, logout } = useAuth();
  const { theme } = useTheme();
  const { t, getCurrentLanguage } = useLanguage();
  
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  const currentLanguage = getCurrentLanguage();

  const settingsSections = [
    {
      title: t('profile.account'),
      items: [
        { title: t('profile.profileInfo'), screen: 'EditProfile' },
        { title: t('profile.addresses'), screen: 'Addresses' },
        { title: t('profile.paymentMethods'), screen: 'PaymentMethods' },
      ]
    },
    {
      title: t('profile.preferences'),
      items: [
        { title: t('profile.notificationSettings'), screen: 'NotificationSettings' },
        { title: t('profile.language'), screen: 'Language', badge: currentLanguage.flag },
      ]
    },
    {
      title: t('profile.other'),
      items: [
        { title: t('profile.support'), screen: 'Support' },
        { title: t('profile.logout'), screen: 'Logout', isLogout: true },
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
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
      </View>

      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Summary */}
          <View style={styles.profileSummary}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.displayName || user?.displayName || t('anonymous')}</Text>
              <Text style={styles.profileEmail}>{profile?.email || user?.email || t('no.email')}</Text>
              <Text style={styles.profilePhone}>{profile?.phoneNumber || t('no.phone')}</Text>
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
                    activeOpacity={1.0}
                    onPress={() => {
                      if (item.screen === 'Logout') {
                        Alert.alert(
                          t('logout.title'),
                          t('logout.confirm'),
                          [
                            {
                              text: t('cancel'),
                              style: 'cancel'
                            },
                            {
                              text: t('profile.logout'),
                              onPress: handleLogout
                            }
                          ]
                        );
                      } else {
                        navigation.navigate(item.screen as never);
                      }
                    }}
                  >
                    <Text style={[
                      styles.settingsItemTitle,
                      item.isLogout && styles.logoutText
                    ]}>
                      {item.title}
                    </Text>
                    
                    {item.badge && (
                      <Text style={styles.settingsBadge}>{item.badge}</Text>
                    )}
                    
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
      <BottomTabBar activeTab="Profile" t={t} />
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemTitle: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  settingsItemArrow: {
    color: '#bbb',
    fontSize: 22,
    marginLeft: 8,
  },
  settingsBadge: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutItem: {
    marginTop: 20,
  },
  logoutText: {
    color: '#f44336',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#aaa',
  },
  bottomSpacing: {
    height: 100,
  },
  profileOptionsContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 20,
  },
  profileOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileOptionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  profileOptionArrow: {
    color: '#bbb',
    fontSize: 22,
    marginLeft: 8,
  },
  menuItemIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: '#00B2FF',
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
    borderBottomColor: '#222',
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#bbb',
  },
  settingsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 16,
    marginBottom: 10,
  },
  settingsItemsContainer: {
    backgroundColor: '#1e1e1e',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingsItemTitle: {
    fontSize: 15,
    color: 'white',
    flex: 1,
  },
  settingsItemArrow: {
    color: '#666',
    fontSize: 22,
    marginLeft: 8,
  },
  settingsBadge: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutItem: {
    marginTop: 20,
  },
  logoutText: {
    color: '#f44336',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },
  bottomSpacing: {
    height: 100,
  },
  profileOptionsContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  profileOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profileOptionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  profileOptionArrow: {
    color: '#bbb',
    fontSize: 22,
    marginLeft: 8,
  },
  menuItemIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: '#64b5f6',
  },
}); 