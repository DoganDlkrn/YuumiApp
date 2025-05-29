/*
 * HARİTA VE KONUM SEÇİM EKRANI (MapScreen)
 * 
 * Bu ekran kullanıcının teslimat adresini seçmesini sağlar:
 * 
 * Ana İşlevler:
 * 1. MOCK HARİTA SİSTEMİ:
 *    - İstanbul bölgesi odaklı sanal harita
 *    - Dokunarak konum seçme
 *    - İstanbul'daki önemli noktaları gösterme
 * 
 * 2. KONUM YÖNETİMİ:
 *    - Kullanıcının mevcut konumunu algılama (LocationContext)
 *    - Manuel konum seçimi (haritaya dokunma)
 *    - Seçilen konumu koordinat olarak saklama
 * 
 * 3. GÖRSEL MARKERS:
 *    - Mavi nokta: Kullanıcının gerçek konumu
 *    - Kırmızı pin: Seçilen teslimat adresi
 *    - Landmark işaretleri: Taksim, Kadıköy vb.
 * 
 * 4. ADRES SEÇİMİ:
 *    - Koordinatları adres stringine dönüştürme
 *    - AddressScreen'e yönlendirme
 *    - Seçilen konumu parametre olarak geçirme
 * 
 * Not: Gerçek uygulamada react-native-maps kullanılmalı
 * Şu anda MockMap komponenti ile simüle edilmiş
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Alert,
  Platform,
  ImageSourcePropType,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useLocation, UserLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    title: 'Select Location',
    confirm: 'Confirm Location',
    findingLocation: 'Finding your location...',
    locationError: 'Could not determine your location',
    mockMap: 'Map Component (Mock)',
    latitude: 'Latitude',
    longitude: 'Longitude'
  },
  tr: {
    title: 'Konum Seç',
    confirm: 'Konumu Onayla',
    findingLocation: 'Konumunuz bulunuyor...',
    locationError: 'Konumunuz belirlenemedi',
    mockMap: 'Harita Bileşeni (Mock)',
    latitude: 'Enlem',
    longitude: 'Boylam'
  }
};

// A mock map component since we can't rely on react-native-maps in this environment
// In a real app, you would use react-native-maps or similar library
const MockMap = ({ 
  onLocationSelect, 
  initialLocation,
  currentUserLocation,
  styles
}: { 
  onLocationSelect: (latitude: number, longitude: number) => void,
  initialLocation?: {latitude: number, longitude: number},
  currentUserLocation?: {latitude: number, longitude: number} | null,
  styles: any // Pass styles as props
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{x: number, y: number} | null>(null);
  const [userLocationPosition, setUserLocationPosition] = useState<{x: number, y: number} | null>(null);
  const mapWidth = Dimensions.get('window').width;
  const mapHeight = 300;
  
  // Istanbul map boundaries (expanded for better coverage)
  const maxLat = 41.3; // North bound (extended)
  const minLat = 40.7; // South bound (extended)
  const maxLng = 29.5; // East bound (extended)
  const minLng = 28.5; // West bound (extended)
  
  const convertCoordinatesToPosition = (latitude: number, longitude: number) => {
    const x = ((longitude - minLng) / (maxLng - minLng)) * mapWidth;
    const y = ((maxLat - latitude) / (maxLat - minLat)) * mapHeight;
    return { x, y };
  };
  
  const convertPositionToCoordinates = (x: number, y: number) => {
    const longitude = minLng + (x / mapWidth) * (maxLng - minLng);
    const latitude = maxLat - (y / mapHeight) * (maxLat - minLat);
    return { latitude, longitude };
  };
  
  useEffect(() => {
    if (initialLocation) {
      const position = convertCoordinatesToPosition(
        initialLocation.latitude,
        initialLocation.longitude
      );
      setSelectedLocation(position);
    }
  }, [initialLocation]);

  // Update user location position on map
  useEffect(() => {
    if (currentUserLocation) {
      const position = convertCoordinatesToPosition(
        currentUserLocation.latitude,
        currentUserLocation.longitude
      );
      setUserLocationPosition(position);
      
      // If no initial location selected, default to user's current location
      if (!selectedLocation && !initialLocation) {
        setSelectedLocation(position);
        onLocationSelect(currentUserLocation.latitude, currentUserLocation.longitude);
      }
    }
  }, [currentUserLocation]);
  
  const handleMapPress = (event: any) => {
    // Get touch coordinates relative to the map view
    const { locationX, locationY } = event.nativeEvent;
    
    // Ensure coordinates are within map bounds
    if (locationX < 0 || locationX > mapWidth || locationY < 0 || locationY > mapHeight) {
      return;
    }
    
    setSelectedLocation({ x: locationX, y: locationY });
    
    const { latitude, longitude } = convertPositionToCoordinates(locationX, locationY);
    onLocationSelect(latitude, longitude);
  };
  
  return (
    <View style={styles.mapContainer}>
      <TouchableWithoutFeedback onPress={handleMapPress}>
        <View style={styles.mockMap}>
          <Text style={styles.mapInstructions}>
            İstanbul Haritası{'\n'}
            Konum seçmek için haritaya dokunun
          </Text>
          
                      {/* Background map image placeholder with grid */}
            <View style={styles.mapImagePlaceholder}>
              {/* Simple grid pattern to simulate map */}
              <View style={styles.mapGrid} />
              
              {/* Sample location markers for Istanbul landmarks */}
              <View style={[styles.landmarkMarker, { left: '45%', top: '45%' }]}>
                <Text style={styles.landmarkText}>Taksim</Text>
              </View>
              <View style={[styles.landmarkMarker, { left: '50%', top: '55%' }]}>
                <Text style={styles.landmarkText}>Karaköy</Text>
              </View>
              <View style={[styles.landmarkMarker, { left: '55%', top: '65%' }]}>
                <Text style={styles.landmarkText}>Kadıköy</Text>
              </View>
              <View style={[styles.landmarkMarker, { left: '40%', top: '50%' }]}>
                <Text style={styles.landmarkText}>Beşiktaş</Text>
              </View>
            </View>
          
          {/* User's current location (blue dot) */}
          {userLocationPosition && (
            <View 
              style={[
                styles.userLocationMarker, 
                { 
                  left: userLocationPosition.x - 8, 
                  top: userLocationPosition.y - 8,
                }
              ]}
            >
              <View style={styles.userLocationDot} />
              <View style={styles.userLocationPulse} />
            </View>
          )}

          {/* Selected location marker (red pin) */}
          {selectedLocation && (
            <View 
              style={[
                styles.locationMarker, 
                { 
                  left: selectedLocation.x - 12, 
                  top: selectedLocation.y - 24,
                }
              ]}
            >
              <Image 
                source={require('../assets/images/placeholder.png')} 
                style={styles.markerIcon} 
              />
              <View style={styles.markerDot} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapScreenNavProp = StackNavigationProp<RootStackParamList, 'Map'>;

const MapScreen = () => {
  const navigation = useNavigation() as MapScreenNavProp;
  const route = useRoute<MapScreenRouteProp>();
  const { currentLocation, setCurrentLocation, getCurrentLocation } = useLocation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  
  const initialLocation = route.params?.currentLocation || null;
  
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLocation?.latitude || 41.0082,
    longitude: initialLocation?.longitude || 28.9784,
  });
  const [currentAddress, setCurrentAddress] = useState('');
  const [loading, setLoading] = useState(true);

  // Get user's current location if no initial location provided
  useEffect(() => {
    const getLocationData = async () => {
      if (!initialLocation) {
        setLoading(true);
        
        // Try to get real location from the LocationContext
        if (currentLocation) {
          console.log('Using current location from context:', currentLocation);
          setSelectedLocation({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          });
          setLoading(false);
        } else {
          // Try to get location using getCurrentLocation from context
          console.log('No current location, trying to get location...');
          try {
            await getCurrentLocation();
            // Wait a bit for the location to be updated
            setTimeout(() => {
              // getCurrentLocation will have updated currentLocation if successful
              setLoading(false);
            }, 2000);
          } catch (error) {
            console.error('Error getting location:', error);
            // Fallback to Istanbul defaults
            console.log('No location available, using Istanbul defaults');
            setSelectedLocation({
              latitude: 41.0082, // Istanbul latitude
              longitude: 28.9784, // Istanbul longitude
            });
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };
    
    getLocationData();
  }, [initialLocation, getCurrentLocation]);

  // Update selected location when currentLocation changes
  useEffect(() => {
    if (currentLocation && !initialLocation) {
      console.log('Current location updated, updating map location:', currentLocation);
      setSelectedLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
      setLoading(false);
    }
  }, [currentLocation, initialLocation]);

  // Reverse geocode to get address from coordinates
  useEffect(() => {
    // This would normally use a service like Google Geocoding API
    // For this example, we'll just use the coordinates as the address
    setCurrentAddress(`${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}`);
  }, [selectedLocation]);

  const handleMapPress = (event: any) => {
    // Event tipini herhangi bir şey olarak belirtelim
    setSelectedLocation({
      latitude: event.nativeEvent?.coordinate?.latitude || 41.0082,
      longitude: event.nativeEvent?.coordinate?.longitude || 28.9784
    });
  };

  const handleConfirmLocation = () => {
    navigation.navigate('Address', {
      location: {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: currentAddress
      }
    });
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
          <Text style={styles.headerTitle}>{t.title}</Text>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {/* Map View */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t.findingLocation}</Text>
          </View>
        ) : (
          <>
            <MockMap
              onLocationSelect={(latitude, longitude) => {
                setSelectedLocation({ latitude, longitude });
              }}
              initialLocation={selectedLocation}
              currentUserLocation={currentLocation}
              styles={styles}
            />
            
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{currentAddress}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirmLocation}
            >
              <Text style={styles.confirmButtonText}>{t.confirm}</Text>
            </TouchableOpacity>
          </>
        )}
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
    paddingBottom: 20,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    overflow: 'hidden',
  },
  mockMap: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapImagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    // Add grid lines (simplified)
  },
  mapInstructions: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    zIndex: 1,
  },
  locationMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  markerIcon: {
    width: 24,
    height: 24,
    tintColor: '#00B2FF',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00B2FF',
    position: 'absolute',
    bottom: 0,
  },
  locationInfoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  coordinatesContainer: {
    paddingVertical: 10,
  },
  coordinatesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  noLocationText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },
  confirmButton: {
    backgroundColor: '#00B2FF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  addressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addressText: {
    fontSize: 16,
  },
  landmarkMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 178, 255, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  landmarkText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userLocationMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
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
    paddingBottom: 20,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    overflow: 'hidden',
  },
  mockMap: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapImagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2a2a2a',
    opacity: 0.5,
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
    // Add grid lines (simplified)
  },
  mapInstructions: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 14,
    zIndex: 1,
  },
  locationMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  markerIcon: {
    width: 24,
    height: 24,
    tintColor: '#64b5f6',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#64b5f6',
    position: 'absolute',
    bottom: 0,
  },
  locationInfoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  coordinatesContainer: {
    paddingVertical: 10,
  },
  coordinatesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  noLocationText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },
  confirmButton: {
    backgroundColor: '#1e88e5',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  addressContainer: {
    backgroundColor: '#121212',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addressText: {
    fontSize: 16,
    color: '#ccc',
  },
  landmarkMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(30, 136, 229, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  landmarkText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userLocationMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
});

export default MapScreen; 