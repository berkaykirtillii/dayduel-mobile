import { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrbButton, StatCard, StreakBadge } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

export default function HomeScreen() {
  const { todayScore, streak, bestScore, checkCanPlay, refresh } = useGameState();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleStartDuel = async () => {
    const canPlay = await checkCanPlay();
    if (canPlay) {
      router.push('/game');
    } else {
      router.push('/paywall');
    }
  };

  const handleOpenProfile = () => {
    router.push('/profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>DAYDUEL</Text>
        <TouchableOpacity 
          onPress={handleOpenProfile}
          style={styles.profileButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {streak > 0 ? (
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakCount}>{streak}</Text>
            </View>
          ) : (
            <View style={styles.profileBadge}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.orbContainer}>
        <OrbButton onPress={handleStartDuel} />
      </View>

      <View style={styles.stats}>
        <View style={styles.statRow}>
          <StatCard label="Today's Score" value={todayScore.toLocaleString()} />
          <View style={styles.statGap} />
          <StatCard label="Streak" value={`${streak} days`} />
        </View>
        <Text style={styles.bestScore}>Best {bestScore.toLocaleString()}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logo: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 2,
  },
  profileButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  streakIcon: {
    fontSize: typography.sizes.md,
    marginRight: spacing.xs,
  },
  streakCount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  profileBadge: {
    backgroundColor: colors.card,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 40,
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: typography.sizes.md,
  },
  orbContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statGap: {
    width: spacing.md,
  },
  bestScore: {
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
});
