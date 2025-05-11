import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationToggle from '../components/NotificationToggle';
import TouchableWithoutFeedback from '../components/TouchableWithoutFeedback';

type NotificationSettingsScreenNavProp = StackNavigationProp<RootStackParamList, 'NotificationSettings'>;

export default function NotificationSettingsScreen() {
  const navigation = useNavigation() as NotificationSettingsScreenNavProp;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  // State for notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [phoneNotifications, setPhoneNotifications] = useState(true);

  return (
    <SafeAreaView 
      style={[styles.container, isDark && styles.darkContainer]} 
      edges={['top']}
    >
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#1e88e5" : "#00B2FF"}
      />
      
      {/* Header */}
      <View style={[styles.headerSection, isDark && styles.darkHeaderSection]}>
        <View style={styles.headerContent}>
          <TouchableWithoutFeedback 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={1.0}
          >
            <Text style={[styles.backButtonText, isDark && styles.darkTextColor]}>←</Text>
          </TouchableWithoutFeedback>
          <Text style={[styles.headerTitle, isDark && styles.darkTextColor]}>
            {t('notifications.settings')}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      {/* Content Container */}
      <View style={[styles.contentContainer, isDark && styles.darkContentContainer]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Email Notifications */}
          <NotificationToggle
            title={t('notifications.email')}
            description={t('notifications.emailDescription')}
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
          
          {/* Push Notifications */}
          <NotificationToggle
            title={t('notifications.push')}
            description={t('notifications.pushDescription')}
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          
          {/* SMS Notifications */}
          <NotificationToggle
            title={t('notifications.sms')}
            description={t('notifications.smsDescription')}
            value={smsNotifications}
            onValueChange={setSmsNotifications}
          />
          
          {/* Phone Call Notifications */}
          <NotificationToggle
            title={t('notifications.phone')}
            description={t('notifications.phoneDescription')}
            value={phoneNotifications}
            onValueChange={setPhoneNotifications}
          />
          
          {/* Legal Information */}
          <View style={styles.disclaimerContainer}>
            <Text style={[styles.disclaimerText, isDark && styles.darkDisclaimerText]}>
              {t('notifications.disclaimer')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B2FF',
  },
  darkContainer: {
    backgroundColor: '#1e88e5',
  },
  headerSection: {
    backgroundColor: '#00B2FF',
    paddingBottom: 15,
  },
  darkHeaderSection: {
    backgroundColor: '#1e88e5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  darkTextColor: {
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  placeholder: {
    width: 30,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  darkContentContainer: {
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  disclaimerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
    textAlign: 'center',
  },
  darkDisclaimerText: {
    color: '#777',
  },
}); 