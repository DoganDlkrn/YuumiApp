import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Svg, Path, Rect, G, Text as SvgText, Circle } from 'react-native-svg';

interface ToggleTabsProps {
  activeTab: 'weekly' | 'daily';
  onToggle: (tab: 'weekly' | 'daily') => void;
}

const ToggleTabs: React.FC<ToggleTabsProps> = ({ activeTab, onToggle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggleWrapper}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            styles.leftToggleOption,
            activeTab === "weekly" && styles.activeToggle
          ]}
          onPress={() => onToggle("weekly")}
        >
          <View style={styles.iconContainer}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Rect
                x="2"
                y="4"
                width="20"
                height="18"
                rx="2"
                stroke={activeTab === "weekly" ? "#00B2FF" : "#777"}
                strokeWidth="2"
                fill="none"
              />
              <Rect
                x="2"
                y="4"
                width="20"
                height="6"
                fill={activeTab === "weekly" ? "#00B2FF" : "#777"}
              />
              <SvgText
                x="12"
                y="16"
                fontSize="10"
                fontWeight="bold"
                fill={activeTab === "weekly" ? "#00B2FF" : "#777"}
                textAnchor="middle"
              >
                7
              </SvgText>
            </Svg>
          </View>
          <Text style={[
            styles.toggleText,
            activeTab === "weekly" && styles.activeToggleText
          ]}>Haftalık</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            styles.rightToggleOption,
            activeTab === "daily" && styles.activeToggle
          ]}
          onPress={() => onToggle("daily")}
        >
          <View style={styles.iconContainer}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <G fill="none" stroke={activeTab === "daily" ? "#00B2FF" : "#777"} strokeWidth="2">
                <Circle cx="12" cy="12" r="10" />
                <Path d="M12 6v6L16 10" />
              </G>
            </Svg>
          </View>
          <Text style={[
            styles.toggleText,
            activeTab === "daily" && styles.activeToggleText
          ]}>Günlük</Text>
        </TouchableOpacity>
      </View>
      {/* Underline indicator for active tab */}
      <View style={styles.underlineContainer}>
        <View 
          style={[
            styles.underline, 
            { left: activeTab === 'weekly' ? '25%' : '75%' }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  toggleWrapper: {
    flexDirection: 'row',
    width: '80%',
    maxWidth: 500,
    marginBottom: 8,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leftToggleOption: {
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  rightToggleOption: {
    justifyContent: 'flex-start',
    paddingLeft: 20,
  },
  activeToggle: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#777',
  },
  activeToggleText: {
    color: '#00B2FF',
    fontWeight: '700',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeImage: {
    tintColor: '#00B2FF',
  },
  underlineContainer: {
    position: 'relative',
    width: '80%',
    maxWidth: 500,
    height: 4,
  },
  underline: {
    position: 'absolute',
    width: '50%',
    height: 3,
    backgroundColor: '#00B2FF',
    borderRadius: 3,
    transform: [{ translateX: -50 }],
  },
});

export default ToggleTabs; 