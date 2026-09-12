import { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrbButton, StatCard, StreakBadge } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

export default function HomeScreen() {
  const { todayScore, streak, bestScore, checkCanPlay, refresh, duelsToday, isPro } = useGameState();

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

  const canPlayToday = isPro || duelsToday < 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>DAYDUEL</Text>
          <Text style={styles.tagline}>5-MIN MIND SPRINT</Text>
        </View>
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
        <OrbButton 
          onPress={handleStartDuel} 
          disabled={!canPlayToday}
          subtitle={canPlayToday ? 'TAP TO START' : 'COME BACK TOMORROW'}
        />
        {!canPlayToday && (
          <TouchableOpacity onPress={() => router.push('/paywall')} style={styles.unlockHint}>
            <Text style={styles.unlockText}>or unlock unlimited with Pro →</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsLabel}>TODAY'S PROGRESS</Text>
        </View>
        <View style={styles.statRow}>
          <StatCard label="Score" value={todayScore.toLocaleString()} />
          <View style={styles.statGap} />
          <StatCard label="Streak" value={`${streak}🔥`} variant={streak > 0 ? 'highlight' : 'default'} />
        </View>
        <View style={styles.bestScoreContainer}>
          <Text style={styles.bestScoreLabel}>PERSONAL BEST</Text>
          <Text style={styles.bestScoreValue}>{bestScore.toLocaleString()}</Text>
        </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {},
  logo: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: 2,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  streakIcon: {
    fontSize: typography.sizes.lg,
    marginRight: spacing.xs,
  },
  streakCount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.orange,
  },
  profileBadge: {
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 44,
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: typography.sizes.lg,
  },
  orbContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockHint: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  unlockText: {
    fontSize: typography.sizes.sm,
    color: colors.magenta,
  },
  stats: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  statsHeader: {
    marginBottom: spacing.sm,
  },
  statsLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    letterSpacing: 2,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statGap: {
    width: spacing.md,
  },
  bestScoreContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  bestScoreLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    letterSpacing: 1,
    fontWeight: '600',
  },
  bestScoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
});
