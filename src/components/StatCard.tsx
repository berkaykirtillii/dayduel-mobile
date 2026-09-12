import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'highlight';
}

export function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  return (
    <View style={[styles.card, variant === 'highlight' && styles.highlight]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  highlight: {
    borderColor: colors.orange,
    borderWidth: 1,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: typography.display.letterSpacing,
  },
});
