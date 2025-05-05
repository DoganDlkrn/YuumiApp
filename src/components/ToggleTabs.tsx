import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Svg, Path, Rect, G, Text as SvgText, Circle, Line, Polyline } from 'react-native-svg';

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
              <G stroke={activeTab === "weekly" ? "#00B2FF" : "#555"} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <Line x1="16" y1="2" x2="16" y2="6" />
                <Line x1="8" y1="2" x2="8" y2="6" />
                <Line x1="3" y1="10" x2="21" y2="10" />
                <SvgText x="12" y="19" textAnchor="middle" fontSize="9" fontFamily="Arial" fill={activeTab === "weekly" ? "#00B2FF" : "#555"}>7</SvgText>
              </G>
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
              <G fill="none" stroke={activeTab === "daily" ? "#00B2FF" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Circle cx="12" cy="12" r="10" />
                <Polyline points="12 6 12 12 16 14" />
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
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    height: 50,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  leftToggleOption: {
    marginRight: 2,
  },
  rightToggleOption: {
    marginLeft: 2,
  },
  activeToggle: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#777',
  },
  activeToggleText: {
    color: '#00B2FF',
    fontWeight: '600',
  },
  underlineContainer: {
    position: 'relative',
    height: 2,
    marginTop: 2,
  },
  underline: {
    position: 'absolute',
    width: '20%',
    height: 2,
    backgroundColor: '#00B2FF',
    borderRadius: 1,
    transform: [{translateX: -20}],
  }
});

export default ToggleTabs; 