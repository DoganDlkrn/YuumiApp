import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationSettingsScreenNavProp = StackNavigationProp<RootStackParamList, 'NotificationSettings'>;

// Keys for AsyncStorage
const EMAIL_NOTIFICATIONS_KEY = 'emailNotifications';
const PUSH_NOTIFICATIONS_KEY = 'pushNotifications';
const SMS_NOTIFICATIONS_KEY = 'smsNotifications';
const PHONE_NOTIFICATIONS_KEY = 'phoneNotifications';

export default function NotificationSettingsScreen() {
  const navigation = useNavigation() as NotificationSettingsScreenNavProp;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  // State for notification preferences - all default to true
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [phoneNotifications, setPhoneNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const emailPref = await AsyncStorage.getItem(EMAIL_NOTIFICATIONS_KEY);
        const pushPref = await AsyncStorage.getItem(PUSH_NOTIFICATIONS_KEY);
        const smsPref = await AsyncStorage.getItem(SMS_NOTIFICATIONS_KEY);
        const phonePref = await AsyncStorage.getItem(PHONE_NOTIFICATIONS_KEY);
        
        // Only update state if a preference was previously saved
        if (emailPref !== null) setEmailNotifications(emailPref === 'true');
        if (pushPref !== null) setPushNotifications(pushPref === 'true');
        if (smsPref !== null) setSmsNotifications(smsPref === 'true');
        if (phonePref !== null) setPhoneNotifications(phonePref === 'true');
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preference to AsyncStorage when changed
  const updateEmailNotifications = (value: boolean) => {
    setEmailNotifications(value);
    AsyncStorage.setItem(EMAIL_NOTIFICATIONS_KEY, value.toString());
  };

  const updatePushNotifications = (value: boolean) => {
    setPushNotifications(value);
    AsyncStorage.setItem(PUSH_NOTIFICATIONS_KEY, value.toString());
  };

  const updateSmsNotifications = (value: boolean) => {
    setSmsNotifications(value);
    AsyncStorage.setItem(SMS_NOTIFICATIONS_KEY, value.toString());
  };

  const updatePhoneNotifications = (value: boolean) => {
    setPhoneNotifications(value);
    AsyncStorage.setItem(PHONE_NOTIFICATIONS_KEY, value.toString());
  };

  if (isLoading) {
    return (
      <SafeAreaView 
        style={[styles.container, isDark && styles.darkContainer]} 
        edges={['top']}
      >
        <View style={[styles.contentContainer, isDark && styles.darkContentContainer, styles.loadingContainer]}>
          <Text style={[isDark ? styles.darkTextColor : styles.textColor]}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            onValueChange={updateEmailNotifications}
          />
          
          {/* Push Notifications */}
          <NotificationToggle
            title={t('notifications.push')}
            description={t('notifications.pushDescription')}
            value={pushNotifications}
            onValueChange={updatePushNotifications}
          />
          
          {/* SMS Notifications */}
          <NotificationToggle
            title={t('notifications.sms')}
            description={t('notifications.smsDescription')}
            value={smsNotifications}
            onValueChange={updateSmsNotifications}
          />
          
          {/* Phone Call Notifications */}
          <NotificationToggle
            title={t('notifications.phone')}
            description={t('notifications.phoneDescription')}
            value={phoneNotifications}
            onValueChange={updatePhoneNotifications}
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
  textColor: {
    color: '#333',
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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