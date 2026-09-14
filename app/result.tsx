import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { adjustDifficultyAfterGame } from '../src/utils/difficulty';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

const ROUNDS = [
  { id: 'echo', name: 'ECHO', subtitle: 'Memory heat', color: colors.orange, number: 1 },
  { id: 'snap', name: 'SNAP', subtitle: 'Reflex heat', color: colors.magenta, number: 2 },
  { id: 'lock', name: 'LOCK', subtitle: 'Focus heat', color: colors.orange, number: 3 },
];

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    score?: string;
    echoScore?: string;
    snapScore?: string;
    lockScore?: string;
    duelId?: string;
  }>();

  const score = parseInt(params.score || '0', 10);
  const echoScore = params.echoScore ? parseInt(params.echoScore, 10) : null;
  const snapScore = params.snapScore ? parseInt(params.snapScore, 10) : null;
  const lockScore = params.lockScore ? parseInt(params.lockScore, 10) : null;
  const duelId = params.duelId || '';

  const roundScores = [echoScore, snapScore, lockScore];

  const { submitScore, bestScore, streak, checkCanPlay, isPro, devUnlimited } = useGameState();
  const [newStreak, setNewStreak] = useState(streak);
  const [isNewBest, setIsNewBest] = useState(false);
  const [canPlayMore, setCanPlayMore] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasSubmitted || !duelId) return;

    const saveResult = async () => {
      setHasSubmitted(true);

      const result = await submitScore(score, duelId);

      if (!result.wasAlreadySubmitted) {
        setNewStreak(result.newStreak);
        setIsNewBest(score > bestScore && score === result.newBestScore);

        const echoAcc = echoScore !== null ? Math.min(1, echoScore / 1000) : 0.5;
        const snapAcc = snapScore !== null ? Math.min(1, snapScore / 750) : 0.5;
        const lockAcc = lockScore !== null ? Math.min(1, lockScore / 900) : 0.5;

        await adjustDifficultyAfterGame({
          echoAccuracy: echoAcc,
          snapAccuracy: snapAcc,
          lockAccuracy: lockAcc,
          totalScore: score,
        });
      } else {
        setNewStreak(result.newStreak);
      }

      const canPlay = await checkCanPlay();
      setCanPlayMore(canPlay);
    };

    saveResult();

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scoreAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [duelId]);

  const handleGoHome = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.headerLabel}>DAY CLEARED</Text>
          </View>

          <Animated.View
            style={[
              styles.scoreSection,
              {
                transform: [
                  {
                    scale: scoreAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.score}>{score.toLocaleString()}</Text>
            <Text style={styles.scoreLabel}>TODAY'S SCORE</Text>
          </Animated.View>

          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{newStreak} DAYS</Text>
          </View>

          {isNewBest && (
            <View style={styles.newBestBadge}>
              <Text style={styles.newBestText}>🏆 NEW PERSONAL BEST!</Text>
            </View>
          )}

          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>ROUND BREAKDOWN</Text>
            {ROUNDS.map((round, index) => (
              <View key={round.id} style={styles.roundCard}>
                <View style={styles.roundLeft}>
                  <View style={[styles.roundNumber, { borderColor: round.color }]}>
                    <Text style={[styles.roundNumberText, { color: round.color }]}>
                      {round.number}
                    </Text>
                  </View>
                  <View style={styles.roundInfo}>
                    <Text style={styles.roundName}>{round.name}</Text>
                    <Text style={styles.roundSubtitle}>{round.subtitle}</Text>
                  </View>
                </View>
                <Text style={[styles.roundScore, { color: round.color }]}>
                  {roundScores[index] !== null ? roundScores[index]!.toLocaleString() : '--'}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="SEE YOU TOMORROW"
          onPress={handleGoHome}
          size="lg"
          style={styles.button}
        />
        <Text style={styles.rematchHint}>Rematch tomorrow at dawn</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLabel: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.orange,
    letterSpacing: 4,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  score: {
    fontSize: typography.sizes.hero,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: -2,
    lineHeight: typography.sizes.hero,
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  streakIcon: {
    fontSize: typography.sizes.lg,
  },
  streakText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 1,
  },
  newBestBadge: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  newBestText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
  },
  breakdown: {
    width: '100%',
    marginTop: spacing.md,
  },
  breakdownTitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  roundCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roundLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roundNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  roundNumberText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
  },
  roundInfo: {
    gap: 2,
  },
  roundName: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 1,
  },
  roundSubtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    color: colors.muted,
  },
  roundScore: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
  rematchHint: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.muted,
  },
});
