import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface PasswordToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  size?: number;
}

const PasswordToggle: React.FC<PasswordToggleProps> = ({ 
  isVisible, 
  onToggle,
  size = 24
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Colors
  const iconColor = isDark ? '#CCCCCC' : '#888888';
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityLabel={isVisible ? "Şifreyi gizle" : "Şifreyi göster"}
      accessibilityRole="button"
    >
      {isVisible ? (
        // Eye Open Icon - Simplified to match screenshot
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <G fill="none" stroke={iconColor} strokeWidth="1.5">
            <Path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" />
            <Circle cx="12" cy="12" r="3" />
          </G>
        </Svg>
      ) : (
        // Eye Closed Icon - Simplified to match screenshot
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <G fill="none" stroke={iconColor} strokeWidth="1.5">
            <Path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" />
            <Path d="M3 3l18 18" strokeLinecap="round" />
          </G>
        </Svg>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default PasswordToggle; 