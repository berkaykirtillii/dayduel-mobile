import { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { OrbButton, StatCard, StreakBadge } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';
import { lightImpact } from '../src/utils/haptics';

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
    lightImpact();
    router.push('/profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>DAYDUEL</Text>
          <View style={styles.logoDot} />
        </View>
        <TouchableOpacity 
          onPress={handleOpenProfile}
          style={styles.profileButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          {streak > 0 ? (
            <LinearGradient
              colors={[colors.card, colors.cardBorder]}
              style={styles.streakBadge}
            >
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakCount}>{streak}</Text>
            </LinearGradient>
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
          <StatCard label="Streak" value={`${streak} days`} variant={streak > 0 ? 'highlight' : 'default'} />
        </View>
        <View style={styles.bestScoreContainer}>
          <Text style={styles.bestScoreLabel}>Personal Best</Text>
          <Text style={styles.bestScore}>{bestScore.toLocaleString()}</Text>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 3,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
    marginLeft: spacing.xs,
    marginTop: -typography.sizes.xl / 2,
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
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.orange,
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
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
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
    paddingBottom: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statGap: {
    width: spacing.sm,
  },
  bestScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  bestScoreLabel: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  bestScore: {
    fontSize: typography.sizes.md,
    fontWeight: typography.display.fontWeight,
    color: colors.muted,
  },
});
