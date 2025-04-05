import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';

// Import the app logo
const appLogo = require('../assets/Y.png');

interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [isHidden, setIsHidden] = useState(!visible);

  useEffect(() => {
    if (visible) {
      setIsHidden(false);
      // Start fade in and scale up animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]).start();
    } else {
      // Fade out when not visible
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start(({ finished }) => {
        // Only hide component when animation is finished
        if (finished) {
          setIsHidden(true);
        }
      });
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (isHidden) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={appLogo} style={styles.logo} />
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#00B2FF" style={styles.spinner} />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 140,
    height: 140,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 15,
  },
  spinner: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
  },
});

export default LoadingOverlay; 