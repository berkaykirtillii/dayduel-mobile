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
      <Text style={[styles.value, variant === 'highlight' && styles.valueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  highlight: {
    borderColor: colors.orange,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 90, 31, 0.05)',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: typography.display.letterSpacing,
  },
  valueHighlight: {
    color: colors.orange,
  },
});
