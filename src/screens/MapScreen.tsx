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
  ImageSourcePropType
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
  styles
}: { 
  onLocationSelect: (latitude: number, longitude: number) => void,
  initialLocation?: {latitude: number, longitude: number},
  styles: any // Pass styles as props
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{x: number, y: number} | null>(null);
  const mapWidth = Dimensions.get('window').width;
  const mapHeight = 300;
  
  // Map boundaries (these would normally be handled by the map library)
  const maxLat = 41.1; // North bound
  const minLat = 40.8; // South bound
  const maxLng = 29.3; // East bound
  const minLng = 28.5; // West bound
  
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
  
  const handleMapPress = (event: any) => {
    // We'd normally use the native event from the map component
    // This is a mock implementation
    const { locationX, locationY } = event.nativeEvent;
    setSelectedLocation({ x: locationX, y: locationY });
    
    const { latitude, longitude } = convertPositionToCoordinates(locationX, locationY);
    onLocationSelect(latitude, longitude);
  };
  
  return (
    <View style={styles.mapContainer}>
      <View 
        style={styles.mockMap}
        onTouchStart={handleMapPress}
      >
        <Text style={styles.mapInstructions}>
          Bu bir örnek harita bileşenidir.{'\n'}
          Konum seçmek için dokunun.
        </Text>
        
        {/* Background map image would go here */}
        <View style={styles.mapImagePlaceholder} />
        
        {/* Selected location marker */}
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
    </View>
  );
};

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapScreenNavProp = StackNavigationProp<RootStackParamList, 'Map'>;

const MapScreen = () => {
  const navigation = useNavigation() as MapScreenNavProp;
  const route = useRoute<MapScreenRouteProp>();
  const { currentLocation, setCurrentLocation } = useLocation();
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
    if (!initialLocation) {
      // navigator.geolocation yerine burada farklı bir yaklaşım kullanacağız
      // Gerçek uygulamada Geolocation API kullanılacaktır
      // Örnek varsayılan değerlerle devam edelim
      setSelectedLocation({
        latitude: 41.0082, // İstanbul varsayılan enlem
        longitude: 28.9784, // İstanbul varsayılan boylam
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [initialLocation]);

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
});

export default MapScreen; 