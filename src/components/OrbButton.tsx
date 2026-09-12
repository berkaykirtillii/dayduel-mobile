import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows } from '../constants/theme';
import { mediumImpact } from '../utils/haptics';

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.55;

interface OrbButtonProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export function OrbButton({
  onPress,
  title = 'DAY\nDUEL',
  subtitle = 'TAP TO START',
  disabled = false,
}: OrbButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, [pulseAnim, glowAnim]);

  const handlePress = () => {
    mediumImpact();
    onPress();
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.glowOuter, 
          { 
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.glowInner,
          {
            opacity: Animated.add(glowAnim, 0.2),
            transform: [{ scale: pulseAnim }],
          }
        ]} 
      />
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.disabled]}
          onPress={handlePress}
          activeOpacity={0.85}
          disabled={disabled}
        >
          <LinearGradient
            colors={[colors.orangeLight, colors.orange, colors.orangeDark]}
            style={styles.gradient}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
          >
            <View style={styles.innerRing} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE + 60,
    height: ORB_SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: ORB_SIZE + 50,
    height: ORB_SIZE + 50,
    borderRadius: (ORB_SIZE + 50) / 2,
    backgroundColor: colors.orangeGlow,
  },
  glowInner: {
    position: 'absolute',
    width: ORB_SIZE + 25,
    height: ORB_SIZE + 25,
    borderRadius: (ORB_SIZE + 25) / 2,
    backgroundColor: colors.orangeGlow,
  },
  button: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 25,
    elevation: 15,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    position: 'absolute',
    width: ORB_SIZE - 16,
    height: ORB_SIZE - 16,
    borderRadius: (ORB_SIZE - 16) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: typography.display.letterSpacing,
    lineHeight: typography.sizes.xxxl * 1.1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
    letterSpacing: 3,
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
