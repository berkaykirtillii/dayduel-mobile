import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../constants/theme';

interface StreakBadgeProps {
  streak: number;
  showProfile?: boolean;
}

export function StreakBadge({ streak, showProfile = false }: StreakBadgeProps) {
  if (streak < 1 && !showProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>👤</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {streak > 0 ? (
        <>
          <Text style={styles.icon}>🔥</Text>
          <Text style={styles.count}>{streak}</Text>
        </>
      ) : (
        <Text style={styles.icon}>👤</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 40,
    justifyContent: 'center',
  },
  icon: {
    fontSize: typography.sizes.md,
    marginRight: spacing.xs,
  },
  count: {
    fontSize: typography.sizes.md,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
});
