import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageSourcePropType
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useLocation, Address } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

type AddressScreenRouteProp = RouteProp<RootStackParamList, 'Address'>;
type AddressScreenNavProp = StackNavigationProp<RootStackParamList, 'Address'>;

// Import images
const locationIcon: ImageSourcePropType = require('../assets/images/placeholder.png');
const homeIcon: ImageSourcePropType = require('../assets/images/home.png');
const workIcon: ImageSourcePropType = require('../assets/images/briefcase.png');
const otherIcon: ImageSourcePropType = require('../assets/images/pin.png');

type AddressType = 'home' | 'work' | 'other';

const translations = {
  en: {
    newAddress: 'New Address',
    editAddress: 'Edit Address',
    addressName: 'Address Name',
    addressNamePlaceholder: 'Home, Work, etc.',
    fullAddress: 'Full Address',
    fullAddressPlaceholder: 'Street, Building No',
    details: 'Additional Details (Optional)',
    detailsPlaceholder: 'Apartment no, floor, directions, etc.',
    selectOnMap: 'Select Location on Map',
    save: 'Save Address',
    cancel: 'Cancel',
    addressTypes: {
      home: 'Home',
      work: 'Work',
      other: 'Other'
    }
  },
  tr: {
    newAddress: 'Yeni Adres',
    editAddress: 'Adresi Düzenle',
    addressName: 'Adres Adı',
    addressNamePlaceholder: 'Ev, İş, vb.',
    fullAddress: 'Tam Adres',
    fullAddressPlaceholder: 'Sokak, Bina No',
    details: 'Ek Bilgiler (İsteğe Bağlı)',
    detailsPlaceholder: 'Daire no, kat, yönlendirme, vb.',
    selectOnMap: 'Haritada Konum Seç',
    save: 'Adresi Kaydet',
    cancel: 'İptal',
    addressTypes: {
      home: 'Ev',
      work: 'İş',
      other: 'Diğer'
    }
  }
};

const AddressScreen = () => {
  const navigation = useNavigation() as AddressScreenNavProp;
  const route = useRoute<AddressScreenRouteProp>();
  const { addresses, addAddress, updateAddress } = useLocation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  
  const editAddress = route.params?.address as Address;
  
  const [name, setName] = useState(editAddress?.name || '');
  const [address, setAddress] = useState(editAddress?.address || '');
  const [details, setDetails] = useState(editAddress?.details || '');
  const [type, setType] = useState<Address['type']>(editAddress?.type || 'home');
  const [latitude, setLatitude] = useState(editAddress?.latitude || null);
  const [longitude, setLongitude] = useState(editAddress?.longitude || null);
  const [isDefault, setIsDefault] = useState(editAddress?.isDefault || false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [addressId, setAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.location) {
      const { latitude, longitude, address: formattedAddress } = route.params.location;
      setLatitude(latitude);
      setLongitude(longitude);
      if (formattedAddress) {
        setAddress(formattedAddress);
      }
    }
  }, [route.params?.location]);

  useEffect(() => {
    // If addressId is provided, we're editing an existing address
    const { addressId } = route.params || {};
    
    if (addressId) {
      const addressToEdit = addresses.find(addr => addr.id === addressId);
      if (addressToEdit) {
        setAddressId(addressId);
        setName(addressToEdit.name);
        setAddress(addressToEdit.address);
        setDetails(addressToEdit.details || '');
        setLatitude(addressToEdit.latitude);
        setLongitude(addressToEdit.longitude);
        setIsDefault(addressToEdit.isDefault || false);
        setIsEditing(true);
        setType(addressToEdit.type);
      }
    } else {
      // New address, set defaults
      setIsDefault(addresses.length === 0); // First address is default
    }
  }, [route.params, addresses]);

  const handleSelectLocation = () => {
    navigation.navigate('Map', {
      currentLocation: {
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      }
    });
  };

  const getAddressTypeTitle = (type: AddressType): string => {
    switch (type) {
      case 'home':
        return 'Ev';
      case 'work':
        return 'İş';
      case 'other':
        return 'Diğer';
    }
  };

  const handleSave = async () => {
    if (!name || !address) {
      // Show error message
      return;
    }

    const addressData: Omit<Address, 'id'> = {
      name,
      address,
      details,
      type,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      isDefault,
    };

    if (editAddress) {
      await updateAddress({ ...addressData, id: editAddress.id });
    } else {
      await addAddress(addressData);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme === 'dark' ? "#1e88e5" : "#00B2FF"} />
      
      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{"←"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? t.editAddress : t.newAddress}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidContainer}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Address Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adres Türü</Text>
              <View style={styles.addressTypeContainer}>
                <TouchableOpacity
                  style={[styles.addressTypeButton, type === 'home' && styles.selectedAddressType]}
                  onPress={() => setType('home')}
                >
                  <Image 
                    source={homeIcon} 
                    style={[styles.addressTypeIcon, type === 'home' && styles.selectedAddressTypeIcon]} 
                  />
                  <Text style={[styles.addressTypeText, type === 'home' && styles.selectedAddressTypeText]}>
                    {t.addressTypes.home}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.addressTypeButton, type === 'work' && styles.selectedAddressType]}
                  onPress={() => setType('work')}
                >
                  <Image 
                    source={workIcon} 
                    style={[styles.addressTypeIcon, type === 'work' && styles.selectedAddressTypeIcon]} 
                  />
                  <Text style={[styles.addressTypeText, type === 'work' && styles.selectedAddressTypeText]}>
                    {t.addressTypes.work}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.addressTypeButton, type === 'other' && styles.selectedAddressType]}
                  onPress={() => setType('other')}
                >
                  <Image 
                    source={otherIcon} 
                    style={[styles.addressTypeIcon, type === 'other' && styles.selectedAddressTypeIcon]} 
                  />
                  <Text style={[styles.addressTypeText, type === 'other' && styles.selectedAddressTypeText]}>
                    {t.addressTypes.other}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Custom Title (Optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adres Başlığı (Opsiyonel)</Text>
              <TextInput
                style={styles.textInput}
                placeholder={t.addressNamePlaceholder}
                placeholderTextColor={theme === 'dark' ? '#777' : '#999'}
                value={name}
                onChangeText={setName}
              />
            </View>
            
            {/* Map Location Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Konum</Text>
              <TouchableOpacity 
                style={styles.mapSelection}
                onPress={handleSelectLocation}
              >
                <View style={styles.mapSelectionContent}>
                  <Image source={locationIcon} style={styles.mapIcon} />
                  <Text style={styles.mapSelectionText}>
                    {latitude !== null && longitude !== null 
                      ? 'Konum seçildi' 
                      : t.selectOnMap}
                  </Text>
                </View>
                <Text style={styles.selectionArrow}>›</Text>
              </TouchableOpacity>
              
              {latitude !== null && longitude !== null && (
                <Text style={styles.selectedLocation}>
                  {`Enlem: ${latitude.toFixed(6)}, Boylam: ${longitude.toFixed(6)}`}
                </Text>
              )}
            </View>
            
            {/* Address Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adres</Text>
              <TextInput
                style={[styles.textInput, styles.addressInput]}
                placeholder={t.fullAddressPlaceholder}
                placeholderTextColor={theme === 'dark' ? '#777' : '#999'}
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
            
            {/* Additional Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detay (Opsiyonel)</Text>
              <TextInput
                style={[styles.textInput, styles.detailsInput]}
                placeholder={t.detailsPlaceholder}
                placeholderTextColor={theme === 'dark' ? '#777' : '#999'}
                value={details}
                onChangeText={setDetails}
              />
            </View>
            
            {/* Default Address Option */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, isDefault && styles.checkboxChecked]}
                onPress={() => setIsDefault(!isDefault)}
              >
                {isDefault && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Varsayılan adres olarak ayarla</Text>
            </View>
            
            {/* Save Button */}
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

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
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectedAddressType: {
    backgroundColor: '#E3F2FD',
  },
  addressTypeIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
    tintColor: '#777',
  },
  selectedAddressTypeIcon: {
    tintColor: '#00B2FF',
  },
  addressTypeText: {
    fontSize: 14,
    color: '#777',
  },
  selectedAddressTypeText: {
    fontWeight: 'bold',
    color: '#00B2FF',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  detailsInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  mapSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mapSelectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#00B2FF',
  },
  mapSelectionText: {
    fontSize: 16,
    color: '#333',
  },
  selectionArrow: {
    fontSize: 24,
    color: '#aaa',
  },
  selectedLocation: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#00B2FF',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00B2FF',
  },
  checkMark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#00B2FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 10,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  selectedAddressType: {
    backgroundColor: '#0d47a1',
  },
  addressTypeIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
    tintColor: '#aaa',
  },
  selectedAddressTypeIcon: {
    tintColor: '#90caf9',
  },
  addressTypeText: {
    fontSize: 14,
    color: '#aaa',
  },
  selectedAddressTypeText: {
    fontWeight: 'bold',
    color: '#90caf9',
  },
  textInput: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  detailsInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  mapSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  mapSelectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#64b5f6',
  },
  mapSelectionText: {
    fontSize: 16,
    color: '#eee',
  },
  selectionArrow: {
    fontSize: 24,
    color: '#777',
  },
  selectedLocation: {
    marginTop: 8,
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#64b5f6',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1e88e5',
  },
  checkMark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#eee',
  },
  saveButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressScreen; 