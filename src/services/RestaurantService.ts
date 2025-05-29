import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Interface for Restaurant data
export interface Restaurant {
  id: string;
  adres: string;
  calismaSaatleri: string;
  isim: string;
  kategori: string;
  logoUrl: string;
  menu?: MenuItem[];
  
  // Additional fields for enhanced functionality
  puan?: string | number;
  calculatedRating?: string | number;
  reviewCount?: string | number;
  teslimatSuresi?: string;
  formattedTimeRange?: string;
  konum?: {
    latitude: number;
    longitude: number;
  };
  
  // Alternative field names for compatibility
  name?: string;
  address?: string;
  rating?: string;
  deliveryTime?: string;
  category?: string;
  image?: string;
}

export interface MenuItem {
  id: string;
  isim: string;
  fiyat: number;
}

/**
 * Fetch all restaurants from Firestore
 */
export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const restaurantsCollection = collection(db, 'restaurants');
    const restaurantsSnapshot = await getDocs(restaurantsCollection);
    
    if (restaurantsSnapshot.empty) {
      console.log('No restaurants found in the database');
      return [];
    }
    
    return restaurantsSnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as Restaurant;
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

/**
 * Fetch a specific restaurant by ID
 */
export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  try {
    const restaurantDoc = doc(db, 'restaurants', id);
    const restaurantSnapshot = await getDoc(restaurantDoc);
    
    if (!restaurantSnapshot.exists()) {
      console.log(`Restaurant with ID ${id} not found`);
      return null;
    }
    
    return {
      id: restaurantSnapshot.id,
      ...restaurantSnapshot.data()
    } as Restaurant;
  } catch (error) {
    console.error(`Error fetching restaurant with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch restaurant's menu - tries subcollection first, then restaurant document
 */
export const getRestaurantMenu = async (restaurantId: string): Promise<MenuItem[]> => {
  try {
    // First try to get menu from subcollection
    const menuCollection = collection(db, `restaurants/${restaurantId}/menu`);
    const menuSnapshot = await getDocs(menuCollection);
    
    if (!menuSnapshot.empty) {
      console.log(`Menu found in subcollection for restaurant ${restaurantId}`);
      return menuSnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        } as MenuItem;
      });
    }
    
    // If subcollection is empty, try to get menu from restaurant document
    console.log(`No menu subcollection found, checking restaurant document for ${restaurantId}`);
    const restaurant = await getRestaurantById(restaurantId);
    
    if (restaurant) {
      // Check different possible menu fields
      if (restaurant.menu && Array.isArray(restaurant.menu)) {
        console.log(`Menu found in restaurant.menu for ${restaurantId}`);
        return restaurant.menu;
      }
      
      // Check if there's a menuItems field
      const restaurantData = restaurant as any;
      if (restaurantData.menuItems && Array.isArray(restaurantData.menuItems)) {
        console.log(`Menu found in restaurant.menuItems for ${restaurantId}`);
        return restaurantData.menuItems;
      }
      
      // Check if there's an items field
      if (restaurantData.items && Array.isArray(restaurantData.items)) {
        console.log(`Menu found in restaurant.items for ${restaurantId}`);
        return restaurantData.items;
      }
    }
    
    console.log(`No menu items found anywhere for restaurant ${restaurantId}`);
    return [];
  } catch (error) {
    console.error(`Error fetching menu for restaurant ${restaurantId}:`, error);
    return []; // Return empty array instead of throwing
  }
}; 