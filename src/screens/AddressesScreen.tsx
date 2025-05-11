import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useLocation, Address } from '../context/LocationContext';

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

// We'll create placeholder images in assets folder
const editIcon: ImageSourcePropType = require('../assets/images/edit.png');
const deleteIcon: ImageSourcePropType = require('../assets/images/trash.png');
const homeIcon: ImageSourcePropType = require('../assets/images/home.png');
const workIcon: ImageSourcePropType = require('../assets/images/briefcase.png');
const defaultIcon: ImageSourcePropType = require('../assets/images/star.png');

const AddressesScreen = () => {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { addresses, removeAddress, setDefaultAddress } = useLocation();
  const t = translations[language];

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return homeIcon;
      case 'work':
        return workIcon;
      default:
        return defaultIcon;
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressItem}>
      <View style={styles.addressContent}>
        <Image source={getAddressIcon(item.type)} style={styles.addressIcon} />
        <View style={styles.addressDetails}>
          <Text style={styles.addressName}>{item.name}</Text>
          <Text style={styles.addressText}>{item.address}</Text>
          {item.details && <Text style={styles.addressText}>{item.details}</Text>}
          {item.isDefault && <Text style={styles.defaultText}>{t.defaultAddress}</Text>}
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
    <View style={styles.container}>
      <Text style={styles.title}>{t.title}</Text>
      
      {addresses.length > 0 ? (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id}
          style={styles.addressList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.noAddresses}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('Address')}
      >
        <Text style={styles.addButtonText}>{t.addAddress}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addressList: {
    flex: 1,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
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
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  defaultText: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressesScreen;