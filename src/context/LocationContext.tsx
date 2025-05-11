import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Define address structure
export interface Address {
  id: string;
  name: string; // Home, Work, etc.
  address: string;
  type: 'home' | 'work' | 'other';
  details?: string; // Apartment number, floor, etc.
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

// Current user location
export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

// Context type definition
interface LocationContextType {
  addresses: Address[];
  currentLocation: UserLocation | null;
  selectedAddress: Address | null;
  
  // Methods
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  removeAddress: (id: string) => Promise<void>; // Alias for deleteAddress
  setDefaultAddress: (id: string) => Promise<void>;
  selectAddress: (address: Address | null) => void;
  setCurrentLocation: (location: UserLocation) => void;
  getCurrentLocationAddress: () => Promise<string>;
}

// Storage keys
const ADDRESSES_STORAGE_KEY = '@yuumi_addresses';
const CURRENT_LOCATION_KEY = '@yuumi_current_location';
const SELECTED_ADDRESS_KEY = '@yuumi_selected_address';

// Create context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider component
export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        console.log('📍 Loading location data...');
        
        // Load addresses
        const savedAddresses = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
        if (savedAddresses) {
          const parsedAddresses = JSON.parse(savedAddresses);
          console.log(`📍 Loaded ${parsedAddresses.length} saved addresses`);
          setAddresses(parsedAddresses);
          
          // Set default address as selected if no selected address
          const defaultAddress = parsedAddresses.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          }
        }
        
        // Load current location
        const savedLocation = await AsyncStorage.getItem(CURRENT_LOCATION_KEY);
        if (savedLocation) {
          setCurrentLocation(JSON.parse(savedLocation));
          console.log('📍 Loaded last known location');
        }
        
        // Load selected address
        const savedSelectedAddress = await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
        if (savedSelectedAddress) {
          setSelectedAddress(JSON.parse(savedSelectedAddress));
          console.log('📍 Loaded selected address');
        }
      } catch (error) {
        console.error('❌ Error loading location data:', error);
      }
    };
    
    loadSavedData();
  }, []);

  // Save addresses when they change
  useEffect(() => {
    const saveAddresses = async () => {
      try {
        await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
        console.log(`📍 Saved ${addresses.length} addresses to storage`);
      } catch (error) {
        console.error('❌ Error saving addresses:', error);
      }
    };
    
    if (addresses.length > 0) {
      saveAddresses();
    }
  }, [addresses]);

  // Save selected address when it changes
  useEffect(() => {
    const saveSelectedAddress = async () => {
      try {
        if (selectedAddress) {
          await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(selectedAddress));
          console.log('📍 Saved selected address to storage');
        } else {
          await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
          console.log('📍 Removed selected address from storage');
        }
      } catch (error) {
        console.error('❌ Error saving selected address:', error);
      }
    };
    
    saveSelectedAddress();
  }, [selectedAddress]);

  // Add a new address
  const addAddress = async (address: Omit<Address, 'id'>): Promise<void> => {
    try {
      const newAddress: Address = {
        ...address,
        id: Date.now().toString(),
        isDefault: addresses.length === 0 ? true : address.isDefault
      };
      
      // If this is set as default, update other addresses
      if (newAddress.isDefault) {
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => ({
            ...addr, 
            isDefault: false
          }))
        );
      }
      
      // Add the new address
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      
      // Select this address if it's default or if it's the first address
      if (newAddress.isDefault || addresses.length === 0) {
        selectAddress(newAddress);
      }
      
      console.log(`📍 Added new address: ${newAddress.name}`);
    } catch (error) {
      console.error('❌ Error adding address:', error);
      Alert.alert('Hata', 'Adres eklenirken bir sorun oluştu.');
    }
  };

  // Update an existing address
  const updateAddress = async (address: Address): Promise<void> => {
    try {
      // If setting this as default, update other addresses
      if (address.isDefault) {
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => ({
            ...addr, 
            isDefault: addr.id === address.id
          }))
        );
      }
      
      // Update the address
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => 
          addr.id === address.id ? address : addr
        )
      );
      
      // Update selected address if this was the selected one
      if (selectedAddress?.id === address.id) {
        selectAddress(address);
      }
      
      console.log(`📍 Updated address: ${address.name}`);
    } catch (error) {
      console.error('❌ Error updating address:', error);
      Alert.alert('Hata', 'Adres güncellenirken bir sorun oluştu.');
    }
  };

  // Delete an address
  const deleteAddress = async (id: string): Promise<void> => {
    try {
      const addressToDelete = addresses.find(addr => addr.id === id);
      if (!addressToDelete) return;
      
      // Remove the address
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      setAddresses(updatedAddresses);
      
      // If deleted address was default, set a new default
      if (addressToDelete.isDefault && updatedAddresses.length > 0) {
        const newDefault = { ...updatedAddresses[0], isDefault: true };
        setAddresses(prev => 
          prev.map(addr => 
            addr.id === newDefault.id ? newDefault : addr
          )
        );
        
        // If selected address was deleted, select the new default
        if (selectedAddress?.id === id) {
          selectAddress(newDefault);
        }
      } else if (selectedAddress?.id === id) {
        // If selected address was deleted and no new default, clear selection
        selectAddress(null);
      }
      
      console.log(`📍 Deleted address: ${addressToDelete.name}`);
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      Alert.alert('Hata', 'Adres silinirken bir sorun oluştu.');
    }
  };

  // Set an address as default
  const setDefaultAddress = async (id: string): Promise<void> => {
    try {
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        }))
      );
      
      console.log(`📍 Set address ${id} as default`);
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      Alert.alert('Hata', 'Varsayılan adres ayarlanırken bir sorun oluştu.');
    }
  };

  // Select an address
  const selectAddress = (address: Address | null): void => {
    setSelectedAddress(address);
    console.log(`📍 Selected address: ${address?.name || 'None'}`);
  };

  // Update current location and save to storage
  const updateCurrentLocation = (location: UserLocation): void => {
    setCurrentLocation(location);
    
    // Save to storage
    try {
      AsyncStorage.setItem(CURRENT_LOCATION_KEY, JSON.stringify(location));
      console.log('📍 Saved current location to storage');
    } catch (error) {
      console.error('❌ Error saving current location:', error);
    }
  };

  // Get address from current location using reverse geocoding (mock implementation)
  const getCurrentLocationAddress = async (): Promise<string> => {
    if (!currentLocation) {
      return 'Konum bilgisi yok';
    }
    
    try {
      // In a real app, you would call a geocoding API here
      return `Lat: ${currentLocation.latitude.toFixed(6)}, Lng: ${currentLocation.longitude.toFixed(6)}`;
    } catch (error) {
      console.error('❌ Error getting address from location:', error);
      return 'Adres çözümlenemedi';
    }
  };

  const value: LocationContextType = {
    addresses,
    currentLocation,
    selectedAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    removeAddress: deleteAddress,
    setDefaultAddress,
    selectAddress,
    setCurrentLocation: updateCurrentLocation,
    getCurrentLocationAddress,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

// Custom hook to use the location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    // Provide a safe default instead of throwing an error
    console.warn('useLocation is being used outside of LocationProvider! Using default values instead.');
    return {
      addresses: [],
      currentLocation: null,
      selectedAddress: null,
      addAddress: async () => {},
      updateAddress: async () => {},
      deleteAddress: async () => {},
      removeAddress: async () => {},
      setDefaultAddress: async () => {},
      selectAddress: () => {},
      setCurrentLocation: () => {},
      getCurrentLocationAddress: async () => 'No location available',
    };
  }
  return context;
}; 