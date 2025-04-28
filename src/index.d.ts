declare module '@react-navigation/native' {
  export const NavigationContainer: React.ComponentType<any>;
  export function useNavigation(): any;
  export function useRoute(): any;
}

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
} 