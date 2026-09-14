import { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrbButton } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

export default function HomeScreen() {
  const { todayScore, streak, bestScore, checkCanPlay, refresh, duelsToday, isPro, devUnlimited } = useGameState();

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

  const canPlayToday = isPro || devUnlimited || duelsToday < 1;

  const handleOrbPress = () => {
    if (canPlayToday) {
      handleStartDuel();
    } else {
      router.push('/paywall');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>DAYDUEL</Text>
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
          onPress={handleOrbPress} 
          disabled={false}
          subtitle={canPlayToday ? 'TAP TO START' : 'TAP TO UNLOCK'}
        />
      </View>

      <View style={styles.stats}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TODAY'S SCORE</Text>
            <Text style={styles.statValue}>{todayScore.toLocaleString()}</Text>
          </View>
          <View style={styles.statGap} />
          <View style={[styles.statCard, streak > 0 && styles.statCardHighlight]}>
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={[styles.statValue, streak > 0 && styles.statValueHighlight]}>
              {streak} {streak === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
        <View style={styles.bestScoreContainer}>
          <Text style={styles.bestScoreLabel}>Best</Text>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {},
  logo: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 3,
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
    fontSize: typography.sizes.md,
    marginRight: spacing.xs,
  },
  streakCount: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
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
  stats: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statCardHighlight: {
    borderColor: colors.orange,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: typography.display.letterSpacing,
  },
  statValueHighlight: {
    color: colors.text,
  },
  statGap: {
    width: spacing.md,
  },
  bestScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bestScoreLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.muted,
  },
  bestScoreValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
});
