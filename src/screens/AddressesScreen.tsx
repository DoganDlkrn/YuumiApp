import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ImageSourcePropType,
  StatusBar,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from '../context/LanguageContext';
import { useLocation, Address } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';

const translations = {
  en: {
    title: 'My Addresses',
    addAddress: 'Add New Address',
    noAddresses: 'You have no saved addresses',
    defaultAddress: 'Default Address',
  },
  tr: {
    title: 'Adreslerim',
    addAddress: 'Yeni Adres Ekle',
    noAddresses: 'Kayıtlı adresiniz bulunmamaktadır',
    defaultAddress: 'Varsayılan Adres',
  },
};

// Import images
const editIcon: ImageSourcePropType = require('../assets/images/edit.png');
const deleteIcon: ImageSourcePropType = require('../assets/images/trash.png');
const homeIcon: ImageSourcePropType = require('../assets/images/home.png');
const workIcon: ImageSourcePropType = require('../assets/images/briefcase.png');
const defaultIcon: ImageSourcePropType = require('../assets/images/star.png');
const otherIcon: ImageSourcePropType = require('../assets/images/pin.png');

const AddressesScreen = () => {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { addresses, removeAddress, setDefaultAddress } = useLocation();
  const { theme } = useTheme();
  const t = translations[language];
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return homeIcon;
      case 'work':
        return workIcon;
      case 'other':
        return otherIcon;
      default:
        return defaultIcon;
    }
  };

  // Function to format the address for display
  const formatAddress = (address: string) => {
    try {
      const addressObj = JSON.parse(address);
      let formattedAddress = '';
      
      if (addressObj.street) formattedAddress += addressObj.street;
      if (addressObj.buildingNo) formattedAddress += (formattedAddress ? ', ' : '') + 'No: ' + addressObj.buildingNo;
      if (addressObj.apartmentNo) formattedAddress += (formattedAddress ? ', ' : '') + 'Daire: ' + addressObj.apartmentNo;
      if (addressObj.district) formattedAddress += (formattedAddress ? ', ' : '') + addressObj.district;
      if (addressObj.city) formattedAddress += (formattedAddress ? ', ' : '') + addressObj.city;
      if (addressObj.postalCode) formattedAddress += (formattedAddress ? ', ' : '') + addressObj.postalCode;
      
      return formattedAddress || address;
    } catch (e) {
      // If not JSON format, return as is
      return address;
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressItem}>
      <View style={styles.addressContent}>
        <Image source={getAddressIcon(item.type)} style={styles.addressIcon} />
        <View style={styles.addressDetails}>
          <Text style={styles.addressName}>{item.name}</Text>
          <Text style={styles.addressText}>{formatAddress(item.address)}</Text>
          {item.details && <Text style={styles.addressText}>{item.details}</Text>}
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>{t.defaultAddress}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Address', { address: item })}
          style={styles.actionButton}
        >
          <Image source={editIcon} style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => removeAddress(item.id)} 
          style={styles.actionButton}
        >
          <Image source={deleteIcon} style={styles.actionIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>{t.title}</Text>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {addresses.length > 0 ? (
            <View style={styles.addressList}>
              {addresses.map((item) => (
                <View key={item.id} style={styles.addressItem}>
                  <View style={styles.addressContent}>
                    <Image source={getAddressIcon(item.type)} style={styles.addressIcon} />
                    <View style={styles.addressDetails}>
                      <Text style={styles.addressName}>{item.name}</Text>
                      <Text style={styles.addressText}>{formatAddress(item.address)}</Text>
                      {item.details && <Text style={styles.addressText}>{item.details}</Text>}
                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>{t.defaultAddress}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Address', { address: item })}
                      style={styles.actionButton}
                    >
                      <Image source={editIcon} style={styles.actionIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => removeAddress(item.id)} 
                      style={styles.actionButton}
                    >
                      <Image source={deleteIcon} style={styles.actionIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t.noAddresses}</Text>
            </View>
          )}
          
          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
      
      {/* Add Button - Now at bottom of screen */}
      <TouchableOpacity 
        style={styles.addButtonFixed}
        onPress={() => navigation.navigate('Map')}
      >
        <Text style={styles.addButtonText}>{t.addAddress}</Text>
      </TouchableOpacity>
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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  addressList: {
    marginTop: 8,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  addressContent: {
    flexDirection: 'row',
    flex: 1,
  },
  addressIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: '#00B2FF',
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  defaultBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  defaultText: {
    fontSize: 12,
    color: '#0288D1',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  emptyContainer: {
    paddingVertical: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  addButton: {
    display: 'none', // Hide the original button
  },
  addButtonFixed: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#00B2FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  addressList: {
    marginTop: 8,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  addressContent: {
    flexDirection: 'row',
    flex: 1,
  },
  addressIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: '#64B5F6',
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#f5f5f5',
  },
  addressText: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 2,
  },
  defaultBadge: {
    backgroundColor: '#0d47a1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  defaultText: {
    fontSize: 12,
    color: '#90CAF9',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#bbb',
  },
  emptyContainer: {
    paddingVertical: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  addButton: {
    display: 'none', // Hide the original button
  },
  addButtonFixed: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#00B2FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AddressesScreen;