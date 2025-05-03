import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

type EditProfileScreenNavProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation() as EditProfileScreenNavProp;
  const { user, profile, updateProfile } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Editing mode states
  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  useEffect(() => {
    if (profile) {
      setEmail(profile.email || '');
      setPhoneNumber(profile.phoneNumber || '');
      
      if (profile.displayName) {
        setDisplayName(profile.displayName);
        // Split name for first and last name fields
        const nameParts = profile.displayName.split(' ');
        if (nameParts.length > 0) {
          setFirstName(nameParts[0]);
          setNewFirstName(nameParts[0]);
          if (nameParts.length > 1) {
            setLastName(nameParts.slice(1).join(' '));
            setNewLastName(nameParts.slice(1).join(' '));
          }
        }
      }
    }
  }, [profile]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı girin.');
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    
    setIsLoading(true);
    try {
      await updateProfile({
        displayName: fullName,
        phoneNumber,
        email
      });
      
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi', [
        { 
          text: 'Tamam', 
          onPress: () => navigation.goBack() 
        }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone number as XXX XXX XX XX
  const formatPhoneNumber = (input: string) => {
    // Remove non-digits
    const digits = input.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = digits.slice(0, 10);
    
    let formatted = '';
    for (let i = 0; i < limited.length; i++) {
      // Add spaces after 3rd, 6th, and 8th digits
      if (i === 3 || i === 6 || i === 8) {
        formatted += ' ';
      }
      formatted += limited[i];
    }
    
    return formatted;
  };
  
  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setNewPhoneNumber(formatted);
  };

  const promptEditFirstName = () => {
    Alert.alert(
      'Ad Düzenle',
      'Adınızı düzenlemek istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Düzenle',
          onPress: () => {
            setNewFirstName(firstName);
            setIsEditingFirstName(true);
          }
        }
      ]
    );
  };

  const promptEditLastName = () => {
    Alert.alert(
      'Soyad Düzenle',
      'Soyadınızı düzenlemek istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Düzenle',
          onPress: () => {
            setNewLastName(lastName);
            setIsEditingLastName(true);
          }
        }
      ]
    );
  };

  const promptEditPhone = () => {
    Alert.alert(
      'Telefon Numarası Düzenle',
      'Telefon numaranızı düzenlemek istiyor musunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Düzenle',
          onPress: () => {
            setNewPhoneNumber(phoneNumber.replace('+90 ', ''));
            setIsEditingPhone(true);
          }
        }
      ]
    );
  };

  const saveFirstName = () => {
    setFirstName(newFirstName);
    setIsEditingFirstName(false);
  };

  const saveLastName = () => {
    setLastName(newLastName);
    setIsEditingLastName(false);
  };

  const savePhoneNumber = () => {
    setPhoneNumber(newPhoneNumber.length > 0 ? `+90 ${newPhoneNumber}` : '');
    setIsEditingPhone(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme === 'dark' ? "#1e88e5" : "#00B2FF"} />
      
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.profileInfo')}</Text>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      {/* White Container */}
      <View style={styles.whiteContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* First Name */}
          <View style={styles.profileItemContainer}>
            <View style={styles.profileInfoGroup}>
              <Text style={styles.profileItemLabel}>{t('profile.firstName')}</Text>
              {isEditingFirstName ? (
                <View style={styles.editInputContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={newFirstName}
                    onChangeText={setNewFirstName}
                    autoFocus
                    autoCapitalize="words"
                  />
                  <TouchableOpacity style={styles.saveInputButton} onPress={saveFirstName}>
                    <Text style={styles.saveInputText}>✓</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.profileValueContainer}>
                  <Text style={styles.profileItemValue}>{firstName}</Text>
                  <TouchableOpacity onPress={promptEditFirstName}>
                    <Text style={styles.editIcon}>✎</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          {/* Last Name */}
          <View style={styles.profileItemContainer}>
            <View style={styles.profileInfoGroup}>
              <Text style={styles.profileItemLabel}>{t('profile.lastName')}</Text>
              {isEditingLastName ? (
                <View style={styles.editInputContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={newLastName}
                    onChangeText={setNewLastName}
                    autoFocus
                    autoCapitalize="words"
                  />
                  <TouchableOpacity style={styles.saveInputButton} onPress={saveLastName}>
                    <Text style={styles.saveInputText}>✓</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.profileValueContainer}>
                  <Text style={styles.profileItemValue}>{lastName}</Text>
                  <TouchableOpacity onPress={promptEditLastName}>
                    <Text style={styles.editIcon}>✎</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          {/* Email */}
          <View style={styles.profileItemContainer}>
            <View style={styles.profileInfoGroup}>
              <Text style={styles.profileItemLabel}>{t('profile.email')}</Text>
              <Text style={styles.profileItemValue}>{email}</Text>
            </View>
            <Text style={styles.emailNote}>{t('profile.cantChangeEmail')}</Text>
          </View>
          
          {/* Phone */}
          <View style={styles.profileItemContainer}>
            <View style={styles.profileInfoGroup}>
              <Text style={styles.profileItemLabel}>{t('profile.phone')}</Text>
              {isEditingPhone ? (
                <View style={styles.editInputContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={newPhoneNumber}
                    onChangeText={handlePhoneChange}
                    autoFocus
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity style={styles.saveInputButton} onPress={savePhoneNumber}>
                    <Text style={styles.saveInputText}>✓</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.profileValueContainer}>
                  <Text style={styles.profileItemValue}>{phoneNumber}</Text>
                  <TouchableOpacity onPress={promptEditPhone}>
                    <Text style={styles.editIcon}>✎</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          {/* Save Button */}
          <TouchableOpacity 
            style={[
              styles.saveButton,
              isLoading && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
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
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileItemContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfoGroup: {
    flexDirection: 'column',
  },
  profileItemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editIcon: {
    fontSize: 20,
    color: '#00B2FF',
    paddingHorizontal: 10,
  },
  emailNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#00B2FF',
    paddingVertical: 5,
    fontWeight: '500',
  },
  saveInputButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveInputText: {
    fontSize: 20,
    color: '#00B2FF',
  },
  saveButton: {
    backgroundColor: '#00B2FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#97d2f2',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  whiteContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileItemContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileInfoGroup: {
    flexDirection: 'column',
  },
  profileItemLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  profileValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  editIcon: {
    fontSize: 20,
    color: '#1e88e5',
    paddingHorizontal: 10,
  },
  emailNote: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#1e88e5',
    paddingVertical: 5,
    fontWeight: '500',
  },
  saveInputButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveInputText: {
    fontSize: 20,
    color: '#1e88e5',
  },
  saveButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#345880',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 