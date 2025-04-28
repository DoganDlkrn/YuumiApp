/// <reference types="react" />
/// <reference types="react-native" />

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

declare module 'react-native-safe-area-context';

// React Navigation tür tanımları
declare module '@react-navigation/native' {
  export function useNavigation<T = any>(): T;
  export function useRoute<T = any>(): T;
  // Diğer gerekli fonksiyonlar burada tanımlanabilir
}

declare module '@react-navigation/stack' {
  export type StackNavigationProp<T, K extends keyof T> = {
    navigate: <RouteName extends keyof T>(routeName: RouteName, params?: T[RouteName]) => void;
    goBack: () => void;
    // Diğer gerekli fonksiyonlar burada tanımlanabilir
  };
  export type RouteProp<T, K extends keyof T> = {
    params: T[K];
    key: string;
    name: K;
  };
  export function createStackNavigator(): any;
} 