import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigation from './navigation/AppNavigation';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigation />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
} 