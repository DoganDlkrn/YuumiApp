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

// Updated Address interface with additional fields
interface AddressDetails {
  street: string;
  buildingNo: string;
  apartmentNo: string;
  district: string;
  city: string;
  postalCode: string;
}

const translations = {
  en: {
    newAddress: 'New Address',
    editAddress: 'Edit Address',
    addressName: 'Address Name',
    addressNamePlaceholder: 'Home, Work, etc.',
    street: 'Street',
    streetPlaceholder: 'Enter street name',
    buildingNo: 'Building No',
    buildingNoPlaceholder: 'Enter building number',
    apartmentNo: 'Apartment No',
    apartmentNoPlaceholder: 'Enter apartment number',
    district: 'District',
    districtPlaceholder: 'Enter district/neighborhood',
    city: 'City',
    cityPlaceholder: 'Enter city',
    postalCode: 'Postal Code',
    postalCodePlaceholder: 'Enter postal code',
    details: 'Additional Details (Optional)',
    detailsPlaceholder: 'Directions, landmarks, etc.',
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
    street: 'Sokak',
    streetPlaceholder: 'Sokak adını girin',
    buildingNo: 'Bina No',
    buildingNoPlaceholder: 'Bina numarasını girin',
    apartmentNo: 'Daire No',
    apartmentNoPlaceholder: 'Daire numarasını girin',
    district: 'Mahalle/Semt',
    districtPlaceholder: 'Mahalle/semt adını girin',
    city: 'Şehir',
    cityPlaceholder: 'Şehir adını girin',
    postalCode: 'Posta Kodu',
    postalCodePlaceholder: 'Posta kodunu girin',
    details: 'Ek Bilgiler (İsteğe Bağlı)',
    detailsPlaceholder: 'Yönlendirme, belirgin noktalar, vb.',
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
  const [street, setStreet] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [apartmentNo, setApartmentNo] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [details, setDetails] = useState(editAddress?.details || '');
  const [type, setType] = useState<Address['type']>(editAddress?.type || 'home');
  const [latitude, setLatitude] = useState(editAddress?.latitude || null);
  const [longitude, setLongitude] = useState(editAddress?.longitude || null);
  const [isDefault, setIsDefault] = useState(editAddress?.isDefault || false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [addressId, setAddressId] = useState<string | null>(null);

  // Parse address string into components if editing
  useEffect(() => {
    if (editAddress?.address) {
      try {
        // Try to parse address string if it's in JSON format
        const addressParts = JSON.parse(editAddress.address);
        setStreet(addressParts.street || '');
        setBuildingNo(addressParts.buildingNo || '');
        setApartmentNo(addressParts.apartmentNo || '');
        setDistrict(addressParts.district || '');
        setCity(addressParts.city || '');
        setPostalCode(addressParts.postalCode || '');
      } catch (e) {
        // If not in JSON format, just set the street field with the full address
        setStreet(editAddress.address);
      }
    }
  }, [editAddress]);

  useEffect(() => {
    if (route.params?.location) {
      const { latitude, longitude, address: formattedAddress } = route.params.location;
      setLatitude(latitude);
      setLongitude(longitude);
      if (formattedAddress) {
        setStreet(formattedAddress);
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
        
        try {
          // Try to parse address string if it's in JSON format
          const addressParts = JSON.parse(addressToEdit.address);
          setStreet(addressParts.street || '');
          setBuildingNo(addressParts.buildingNo || '');
          setApartmentNo(addressParts.apartmentNo || '');
          setDistrict(addressParts.district || '');
          setCity(addressParts.city || '');
          setPostalCode(addressParts.postalCode || '');
        } catch (e) {
          // If not in JSON format, just set the street field with the full address
          setStreet(addressToEdit.address);
        }
        
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
    if (!name || !street) {
      Alert.alert(
        'Eksik Bilgi',
        'Lütfen en azından adres adı ve sokak bilgilerini doldurun.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    // Combine all address fields into a JSON string
    const addressData: AddressDetails = {
      street,
      buildingNo,
      apartmentNo,
      district,
      city,
      postalCode
    };

    const addressObject: Omit<Address, 'id'> = {
      name,
      address: JSON.stringify(addressData),
      details,
      type,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      isDefault,
    };

    if (editAddress) {
      await updateAddress({ ...addressObject, id: editAddress.id });
    } else {
      await addAddress(addressObject);
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
            
            {/* Address Name Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.addressName}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.addressNamePlaceholder}
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            {/* Address Details Inputs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.street}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.streetPlaceholder}
                placeholderTextColor="#999"
                value={street}
                onChangeText={setStreet}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.buildingNo}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.buildingNoPlaceholder}
                placeholderTextColor="#999"
                value={buildingNo}
                onChangeText={setBuildingNo}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.apartmentNo}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.apartmentNoPlaceholder}
                placeholderTextColor="#999"
                value={apartmentNo}
                onChangeText={setApartmentNo}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.district}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.districtPlaceholder}
                placeholderTextColor="#999"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.city}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.cityPlaceholder}
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.postalCode}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.postalCodePlaceholder}
                placeholderTextColor="#999"
                value={postalCode}
                onChangeText={setPostalCode}
                keyboardType="numeric"
              />
            </View>
            
            {/* Additional Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.details}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t.detailsPlaceholder}
                placeholderTextColor="#999"
                value={details}
                onChangeText={setDetails}
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
            </View>
            
            {/* Map Selection Button */}
            <TouchableOpacity 
              style={styles.selectOnMapButton}
              onPress={handleSelectLocation}
            >
              <Image source={locationIcon} style={styles.selectOnMapIcon} />
              <Text style={styles.selectOnMapText}>{t.selectOnMap}</Text>
            </TouchableOpacity>
            
            {/* Save Button */}
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
            
            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -8,
    overflow: 'hidden',
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedAddressType: {
    backgroundColor: '#e1f5fe',
    borderColor: '#29b6f6',
  },
  addressTypeIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
    tintColor: '#666',
  },
  selectedAddressTypeIcon: {
    tintColor: '#0288d1',
  },
  addressTypeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedAddressTypeText: {
    color: '#0288d1',
    fontWeight: 'bold',
  },
  selectOnMapButton: {
    flexDirection: 'row',
    backgroundColor: '#e1f5fe',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  selectOnMapIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#0288d1',
  },
  selectOnMapText: {
    fontSize: 16,
    color: '#0288d1',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#00B2FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 80,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e88e5',
  },
  headerSection: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -8,
    overflow: 'hidden',
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#f5f5f5',
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    color: '#f5f5f5',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedAddressType: {
    backgroundColor: '#0d47a1',
    borderColor: '#42a5f5',
  },
  addressTypeIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
    tintColor: '#999',
  },
  selectedAddressTypeIcon: {
    tintColor: '#90caf9',
  },
  addressTypeText: {
    fontSize: 14,
    color: '#999',
  },
  selectedAddressTypeText: {
    color: '#90caf9',
    fontWeight: 'bold',
  },
  selectOnMapButton: {
    flexDirection: 'row',
    backgroundColor: '#0d47a1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  selectOnMapIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#90caf9',
  },
  selectOnMapText: {
    fontSize: 16,
    color: '#90caf9',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default AddressScreen; 