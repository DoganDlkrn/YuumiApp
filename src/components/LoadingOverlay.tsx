import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import YLogo from './YLogo';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  message = 'Yükleniyor',
  transparent = false 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const [isHidden, setIsHidden] = useState(!visible);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Control dots animation
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

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

      // Start rotating animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();

      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      // Fade out when not visible
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start(({ finished }) => {
        // Only hide component when animation is finished
        if (finished) {
          setIsHidden(true);
        }
      });
    }
  }, [visible, fadeAnim, scaleAnim, rotateAnim, pulseAnim]);

  // Create rotating interpolation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isHidden) return null;

  return (
    <Animated.View style={[
      styles.container, 
      { opacity: fadeAnim, backgroundColor: transparent ? 'transparent' : 'rgba(0, 0, 0, 0.7)' }
    ]}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
        {/* Logo and brand identity */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <YLogo size={80} color="#00B2FF" style={styles.logo} />
        </Animated.View>
        
        {/* Animated dots */}
        <View style={styles.spinnerContainer}>
          <Animated.View 
            style={[
              styles.spinner, 
              { transform: [{ rotate: spin }] }
            ]}
          >
            <View style={[styles.dot, { opacity: 0.3 }]} />
            <View style={[styles.dot, { opacity: 0.6 }]} />
            <View style={[styles.dot, { opacity: 0.9 }]} />
            <View style={styles.dot} />
          </Animated.View>
        </View>
        
        <Text style={styles.loadingText}>{message}{dots}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 180,
    height: 220,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logo: {
    marginBottom: 20,
  },
  spinnerContainer: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  spinner: {
    width: 50,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B2FF',
    margin: 3,
  },
  loadingText: {
    color: '#00B2FF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  }
});

export default LoadingOverlay; 