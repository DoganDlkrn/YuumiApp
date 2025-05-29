// Delivery time calculation utilities

// Ortalama sürüş hızı (km/saat)
const AVERAGE_DRIVING_SPEED_KMH = 30;

// Sabit hazırlık süresi (dakika)
const PREPARATION_TIME_MINUTES = 10;

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Convert degrees to radians
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Calculate delivery time based on distance
export const calculateDeliveryTime = (
  userLatitude: number,
  userLongitude: number,
  restaurantLatitude: number,
  restaurantLongitude: number,
  restaurantName?: string
): {
  distance: number;
  travelTimeMinutes: number;
  totalEstimatedTimeMinutes: number;
  formattedTimeRange: string;
} => {
  // Calculate distance
  const distance = calculateDistance(
    userLatitude,
    userLongitude,
    restaurantLatitude,
    restaurantLongitude
  );
  
  // Calculate travel time
  const travelTimeMinutes = (distance / AVERAGE_DRIVING_SPEED_KMH) * 60;
  
  // Calculate total estimated time
  let totalEstimatedTimeMinutes = PREPARATION_TIME_MINUTES + travelTimeMinutes;
  
  // Add extra time for specific restaurants (as in the web code)
  if (restaurantName === "Harpit Kebap Salonu" || restaurantName === "Ocakbaşı Keyfi") {
    totalEstimatedTimeMinutes += 10;
  }
  
  // Format time range (round to nearest 5 minutes)
  const roundedTime = Math.round(totalEstimatedTimeMinutes);
  const lowerBound = Math.floor(roundedTime / 5) * 5;
  const upperBound = lowerBound + 5;
  const formattedTimeRange = `${lowerBound}-${upperBound} dk`;
  
  return {
    distance,
    travelTimeMinutes,
    totalEstimatedTimeMinutes,
    formattedTimeRange
  };
};

// Parse price from various formats (from web code)
export const parsePrice = (priceString: string | number): number => {
  // Return 0 for null/undefined values
  if (!priceString) return 0;
  
  // If it's already a number, return it
  if (typeof priceString === 'number') return priceString;
  
  // If it's a string, try to extract the number
  if (typeof priceString === 'string') {
    // Remove currency symbols, dots as thousand separators, and replace commas with dots
    const cleanedString = priceString
      .replace(/[₺TL]/gi, '')  // Remove TL and ₺ symbols
      .replace(/\s+/g, '')     // Remove whitespace
      .replace(/\./g, '')      // Remove dots (thousand separators)
      .replace(/,/g, '.');     // Replace commas with dots for decimal points
    
    const parsedValue = parseFloat(cleanedString);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }
  
  return 0;
};

// Calculate average price of menu items
export const calculateAveragePrice = (menuItems: any[]): number => {
  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    return 0;
  }
  
  let totalPrice = 0;
  let itemCount = 0;
  
  for (const item of menuItems) {
    const price = parsePrice(item.fiyat || item.price);
    if (price > 0) {
      totalPrice += price;
      itemCount++;
    }
  }
  
  return itemCount > 0 ? totalPrice / itemCount : 0;
}; 