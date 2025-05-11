import React from 'react';
import { View, Text, StyleSheet, Switch, SwitchProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface NotificationToggleProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  switchProps?: Partial<SwitchProps>;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  title,
  description,
  value,
  onValueChange,
  switchProps
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDark && styles.darkTitle]}>{title}</Text>
        <Text style={[styles.description, isDark && styles.darkDescription]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D9D9D9', true: '#00B2FF' }}
        thumbColor={'#FFFFFF'}
        ios_backgroundColor="#D9D9D9"
        {...switchProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  darkTitle: {
    color: '#FFF',
  },
  darkDescription: {
    color: '#CCC',
  }
});

export default NotificationToggle; 