import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, StatCard } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { adjustDifficultyAfterGame, getDifficulty, DifficultyLevel } from '../src/utils/difficulty';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

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
  
  const { submitScore, bestScore, streak, checkCanPlay, isPro } = useGameState();
  const [newStreak, setNewStreak] = useState(streak);
  const [newBestScore, setNewBestScore] = useState(bestScore);
  const [isNewBest, setIsNewBest] = useState(false);
  const [canPlayMore, setCanPlayMore] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [difficultyChange, setDifficultyChange] = useState<{
    oldLevel: DifficultyLevel;
    newLevel: DifficultyLevel;
  } | null>(null);
  const difficultyFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasSubmitted || !duelId) return;
    
    const saveResult = async () => {
      setHasSubmitted(true);
      
      const result = await submitScore(score, duelId);
      
      if (!result.wasAlreadySubmitted) {
        setNewStreak(result.newStreak);
        setNewBestScore(result.newBestScore);
        setIsNewBest(score > bestScore && score === result.newBestScore);
      } else {
        setNewStreak(result.newStreak);
        setNewBestScore(result.newBestScore);
      }
      
      const canPlay = await checkCanPlay();
      setCanPlayMore(canPlay);

      const oldDifficulty = await getDifficulty();
      const echoAcc = echoScore !== null ? Math.min(1, echoScore / 1000) : 0.5;
      const snapAcc = snapScore !== null ? Math.min(1, snapScore / 750) : 0.5;
      const lockAcc = lockScore !== null ? Math.min(1, lockScore / 900) : 0.5;
      
      const newDifficulty = await adjustDifficultyAfterGame({
        echoAccuracy: echoAcc,
        snapAccuracy: snapAcc,
        lockAccuracy: lockAcc,
        totalScore: score,
      });

      if (newDifficulty !== oldDifficulty) {
        setDifficultyChange({ oldLevel: oldDifficulty, newLevel: newDifficulty });
        Animated.sequence([
          Animated.timing(difficultyFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
          Animated.timing(difficultyFadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => setDifficultyChange(null));
      }
    };
    
    saveResult();
  }, [duelId]);

  const handleGoHome = () => {
    router.replace('/home');
  };

  const handlePlayAgain = async () => {
    const canPlay = await checkCanPlay();
    if (canPlay) {
      router.replace('/game');
    } else {
      router.push('/paywall');
    }
  };

  const getStreakMessage = () => {
    if (newStreak >= 7) return '🔥 ON FIRE!';
    if (newStreak >= 3) return '⚡ BUILDING MOMENTUM';
    if (newStreak >= 1) return '✓ STREAK STARTED';
    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      {difficultyChange && (
        <Animated.View
          style={[
            styles.difficultyNotification,
            { opacity: difficultyFadeAnim },
          ]}
        >
          <Text style={styles.difficultyNotificationText}>
            {difficultyChange.newLevel > difficultyChange.oldLevel
              ? `⬆️ Difficulty: L${difficultyChange.oldLevel} → L${difficultyChange.newLevel}`
              : `⬇️ Difficulty: L${difficultyChange.oldLevel} → L${difficultyChange.newLevel}`}
          </Text>
        </Animated.View>
      )}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>DUEL</Text>
            <Text style={styles.titleHighlight}>COMPLETE</Text>
          </View>
          
          {isNewBest && (
            <View style={styles.newBestBadge}>
              <Text style={styles.newBestIcon}>🏆</Text>
              <Text style={styles.newBestText}>NEW PERSONAL BEST!</Text>
            </View>
          )}

          <View style={styles.scoreCard}>
            <LinearGradient
              colors={[colors.orangeLight, colors.orange, colors.orangeDark]}
              style={styles.scoreGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.scoreLabel}>TODAY'S SCORE</Text>
              <Text style={styles.score}>{score.toLocaleString()}</Text>
              {isNewBest && <Text style={styles.scoreBadge}>★ BEST ★</Text>}
            </LinearGradient>
          </View>

          <View style={styles.streakContainer}>
            <View style={styles.streakCard}>
              <Text style={styles.streakNumber}>{newStreak}</Text>
              <Text style={styles.streakUnit}>DAY STREAK</Text>
              {newStreak > 0 && (
                <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
              )}
            </View>
          </View>

          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>ROUND BREAKDOWN</Text>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.roundDot, { backgroundColor: colors.orange }]} />
                <Text style={styles.breakdownLabel}>Echo</Text>
                <Text style={styles.breakdownType}>Memory</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: colors.orange }]}>
                {echoScore !== null ? echoScore.toLocaleString() : '--'}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.roundDot, { backgroundColor: colors.magenta }]} />
                <Text style={styles.breakdownLabel}>Snap</Text>
                <Text style={styles.breakdownType}>Reflex</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: colors.magenta }]}>
                {snapScore !== null ? snapScore.toLocaleString() : '--'}
              </Text>
            </View>
            <View style={[styles.breakdownItem, styles.breakdownItemLast]}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.roundDot, { backgroundColor: colors.text }]} />
                <Text style={styles.breakdownLabel}>Lock</Text>
                <Text style={styles.breakdownType}>Focus</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {lockScore !== null ? lockScore.toLocaleString() : '--'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={canPlayMore || isPro ? 'PLAY AGAIN' : 'GO PRO — UNLIMITED'}
          onPress={handlePlayAgain}
          size="lg"
          style={styles.button}
        />
        <Button title="Back to Home" onPress={handleGoHome} variant="ghost" />
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
  difficultyNotification: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.orange,
    zIndex: 100,
    alignItems: 'center',
  },
  difficultyNotificationText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.muted,
    letterSpacing: 4,
  },
  titleHighlight: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 4,
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  newBestIcon: {
    fontSize: 20,
  },
  newBestText: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  scoreCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  scoreGradient: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.xl,
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text,
    opacity: 0.8,
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  score: {
    fontSize: 72,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scoreBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  streakContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  streakCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.orange,
  },
  streakNumber: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.display.fontWeight,
    color: colors.orange,
  },
  streakUnit: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  streakMessage: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.orange,
    marginTop: spacing.sm,
  },
  breakdown: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  breakdownTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  breakdownItemLast: {
    borderBottomWidth: 0,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roundDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  breakdownType: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  breakdownValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
