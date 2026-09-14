import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, spacing } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}: ButtonProps) {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    variant === 'ghost' && styles.textGhost,
  ].filter(Boolean) as TextStyle[];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={buttonStyles}
      >
        <LinearGradient
          colors={[colors.orange, colors.orangeDark]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={textStyles}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        buttonStyles,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
      ]}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl + 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: borderRadius.full,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.text,
    fontFamily: typography.fonts.display,
    fontWeight: '800',
    letterSpacing: 2,
  },
  textGhost: {
    color: colors.muted,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '500',
    letterSpacing: 0,
  },
  size_sm: {},
  size_md: {},
  size_lg: {},
  text_sm: {
    fontSize: typography.sizes.sm,
  },
  text_md: {
    fontSize: typography.sizes.md,
  },
  text_lg: {
    fontSize: typography.sizes.lg + 2,
  },
});
