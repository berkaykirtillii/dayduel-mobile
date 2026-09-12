import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows } from '../constants/theme';

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.6;

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
  return (
    <View style={styles.container}>
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <LinearGradient
          colors={[colors.orangeLight, colors.orange, colors.orangeDark]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: ORB_SIZE + 40,
    height: ORB_SIZE + 40,
    borderRadius: (ORB_SIZE + 40) / 2,
    backgroundColor: colors.orangeGlow,
    opacity: 0.3,
  },
  glowInner: {
    position: 'absolute',
    width: ORB_SIZE + 20,
    height: ORB_SIZE + 20,
    borderRadius: (ORB_SIZE + 20) / 2,
    backgroundColor: colors.orangeGlow,
    opacity: 0.5,
  },
  button: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
    ...shadows.glow,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: typography.display.letterSpacing,
    lineHeight: typography.sizes.xxxl * 1.1,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    letterSpacing: 2,
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
