import React, { useState, useRef, useEffect } from 'react';
import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native';
import { useNavigationContainerRef } from '@react-navigation/native';
import LoadingOverlay from '../components/LoadingOverlay';

interface NavigationContainerProps {
  children: React.ReactNode;
}

const NavigationContainer: React.FC<NavigationContainerProps> = ({ children }) => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>();
  const [loading, setLoading] = useState(false);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  return (
    <RNNavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef?.getCurrentRoute()?.name;
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef?.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName) {
          // Show loading when navigation changes routes
          setLoading(true);
          
          // Clear any existing timer
          if (transitionTimerRef.current) {
            clearTimeout(transitionTimerRef.current);
          }
          
          // Hide loading after a delay
          transitionTimerRef.current = setTimeout(() => {
            setLoading(false);
            transitionTimerRef.current = null;
          }, 800);
        }

        // Save the current route name for later comparison
        routeNameRef.current = currentRouteName;
      }}
    >
      {children}
      <LoadingOverlay visible={loading} />
    </RNNavigationContainer>
  );
};

export default NavigationContainer; 