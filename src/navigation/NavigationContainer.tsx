import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import LoadingOverlay from '../components/LoadingOverlay';
import { View } from 'react-native';

interface NavigationContextType {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavigationLoadingContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigationLoading = () => {
  const context = useContext(NavigationLoadingContext);
  if (context === undefined) {
    throw new Error('useNavigationLoading must be used within a NavigationContainer');
  }
  return context;
};

interface NavigationContainerProps {
  children: React.ReactNode;
}

const NavigationContainer: React.FC<NavigationContainerProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  
  return (
    <NavigationLoadingContext.Provider value={{ loading, setLoading }}>
      <View style={{ flex: 1 }}>
        {children}
        <LoadingOverlay visible={loading} />
      </View>
    </NavigationLoadingContext.Provider>
  );
};

export default NavigationContainer; 