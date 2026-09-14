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
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const ringAnim1 = useRef(new Animated.Value(0.2)).current;
  const ringAnim2 = useRef(new Animated.Value(0.15)).current;
  const ringAnim3 = useRef(new Animated.Value(0.1)).current;
  const magentaAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (disabled) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    const ringLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim1, {
          toValue: 0.35,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim1, {
          toValue: 0.2,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );

    const ringLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim2, {
          toValue: 0.28,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim2, {
          toValue: 0.15,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    const ringLoop3 = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim3, {
          toValue: 0.2,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim3, {
          toValue: 0.1,
          duration: 2800,
          useNativeDriver: true,
        }),
      ])
    );

    const magentaLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(magentaAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(magentaAnim, {
          toValue: 0.25,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    glowLoop.start();
    ringLoop1.start();
    ringLoop2.start();
    ringLoop3.start();
    magentaLoop.start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
      ringLoop1.stop();
      ringLoop2.stop();
      ringLoop3.stop();
      magentaLoop.stop();
    };
  }, [disabled, pulseAnim, glowAnim, ringAnim1, ringAnim2, ringAnim3, magentaAnim]);

  return (
    <View style={styles.container}>
      {/* Outermost ring with magenta tint */}
      <Animated.View
        style={[
          styles.ringOuter,
          { opacity: ringAnim3, transform: [{ scale: pulseAnim }] },
        ]}
      />
      {/* Magenta bloom layer */}
      <Animated.View
        style={[
          styles.magentaBloom,
          { opacity: magentaAnim, transform: [{ scale: pulseAnim }] },
        ]}
      />
      {/* Middle ring */}
      <Animated.View
        style={[
          styles.ringMiddle,
          { opacity: ringAnim2, transform: [{ scale: pulseAnim }] },
        ]}
      />
      {/* Inner ring */}
      <Animated.View
        style={[
          styles.ringInner,
          { opacity: ringAnim1, transform: [{ scale: pulseAnim }] },
        ]}
      />
      {/* Core glow */}
      <Animated.View
        style={[
          styles.glowCore,
          { opacity: glowAnim },
        ]}
      />
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={disabled}
      >
        <LinearGradient
          colors={[colors.orangeLight, colors.orange, colors.orangeDark]}
          style={styles.gradient}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const RING_1 = ORB_SIZE + 24;
const RING_2 = ORB_SIZE + 50;
const RING_3 = ORB_SIZE + 80;
const RING_4 = ORB_SIZE + 110;

const styles = StyleSheet.create({
  container: {
    width: RING_4,
    height: RING_4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: RING_4,
    height: RING_4,
    borderRadius: RING_4 / 2,
    borderWidth: 1.5,
    borderColor: colors.orange,
    backgroundColor: 'transparent',
  },
  magentaBloom: {
    position: 'absolute',
    width: RING_3 + 10,
    height: RING_3 + 10,
    borderRadius: (RING_3 + 10) / 2,
    backgroundColor: 'rgba(255, 45, 149, 0.15)',
  },
  ringMiddle: {
    position: 'absolute',
    width: RING_3,
    height: RING_3,
    borderRadius: RING_3 / 2,
    borderWidth: 1.5,
    borderColor: colors.orange,
    backgroundColor: 'transparent',
  },
  ringInner: {
    position: 'absolute',
    width: RING_2,
    height: RING_2,
    borderRadius: RING_2 / 2,
    borderWidth: 2,
    borderColor: colors.orange,
    backgroundColor: 'transparent',
  },
  glowCore: {
    position: 'absolute',
    width: RING_1,
    height: RING_1,
    borderRadius: RING_1 / 2,
    backgroundColor: colors.orangeGlow,
  },
  button: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 122, 69, 0.6)',
    ...shadows.glow,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: typography.sizes.xxxl * 1.05,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    letterSpacing: 3,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});
