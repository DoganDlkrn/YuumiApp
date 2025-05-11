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
 * Fetch restaurant's menu
 */
export const getRestaurantMenu = async (restaurantId: string): Promise<MenuItem[]> => {
  try {
    const menuCollection = collection(db, `restaurants/${restaurantId}/menu`);
    const menuSnapshot = await getDocs(menuCollection);
    
    if (menuSnapshot.empty) {
      console.log(`No menu items found for restaurant ${restaurantId}`);
      return [];
    }
    
    return menuSnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as MenuItem;
    });
  } catch (error) {
    console.error(`Error fetching menu for restaurant ${restaurantId}:`, error);
    throw error;
  }
}; 