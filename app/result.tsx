import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, StatCard } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { adjustDifficultyAfterGame, getDifficulty, DifficultyLevel } from '../src/utils/difficulty';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';
import { successNotification, mediumImpact } from '../src/utils/haptics';

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
        const achievedNewBest = score > bestScore && score === result.newBestScore;
        setIsNewBest(achievedNewBest);
        if (achievedNewBest) {
          successNotification();
        }
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
        mediumImpact();
        Animated.sequence([
          Animated.timing(difficultyFadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(4000),
          Animated.timing(difficultyFadeAnim, {
            toValue: 0,
            duration: 600,
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

  return (
    <SafeAreaView style={styles.container}>
      {difficultyChange && (
        <Animated.View
          style={[
            styles.difficultyNotification,
            { opacity: difficultyFadeAnim },
          ]}
        >
          <LinearGradient
            colors={difficultyChange.newLevel > difficultyChange.oldLevel 
              ? [colors.success, '#1a8a4c'] 
              : [colors.warning, '#c77808']}
            style={styles.difficultyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.difficultyIcon}>
              {difficultyChange.newLevel > difficultyChange.oldLevel ? '⬆️' : '⬇️'}
            </Text>
            <View style={styles.difficultyContent}>
              <Text style={styles.difficultyLabel}>DIFFICULTY ADJUSTED</Text>
              <Text style={styles.difficultyNotificationText}>
                Level {difficultyChange.oldLevel} → Level {difficultyChange.newLevel}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>DUEL COMPLETE</Text>
        
        {isNewBest && (
          <LinearGradient
            colors={[colors.orange, colors.orangeDark]}
            style={styles.newBestBadge}
          >
            <Text style={styles.newBestText}>🏆 NEW BEST!</Text>
          </LinearGradient>
        )}

        <LinearGradient
          colors={[colors.orangeLight, colors.orange, colors.orangeDark]}
          style={styles.scoreContainer}
        >
          <Text style={styles.scoreLabel}>TOTAL SCORE</Text>
          <Text style={styles.score}>{score.toLocaleString()}</Text>
        </LinearGradient>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{newStreak}</Text>
            <Text style={styles.statLabel}>day streak</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHighlight]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{newBestScore.toLocaleString()}</Text>
            <Text style={styles.statLabel}>personal best</Text>
          </View>
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>ROUND BREAKDOWN</Text>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.roundDot, { backgroundColor: colors.orange }]} />
              <Text style={styles.breakdownLabel}>Echo</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {echoScore !== null ? echoScore.toLocaleString() : '--'}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.roundDot, { backgroundColor: colors.magenta }]} />
              <Text style={styles.breakdownLabel}>Snap</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {snapScore !== null ? snapScore.toLocaleString() : '--'}
            </Text>
          </View>
          <View style={[styles.breakdownItem, styles.breakdownItemLast]}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.roundDot, { backgroundColor: colors.text }]} />
              <Text style={styles.breakdownLabel}>Lock</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {lockScore !== null ? lockScore.toLocaleString() : '--'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={canPlayMore || isPro ? 'PLAY AGAIN' : 'UPGRADE TO PLAY'}
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
  difficultyNotification: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  difficultyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  difficultyIcon: {
    fontSize: 24,
  },
  difficultyContent: {
    flex: 1,
  },
  difficultyLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.8,
    letterSpacing: 1,
  },
  difficultyNotificationText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  newBestBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  newBestText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  scoreContainer: {
    width: '100%',
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.8,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  score: {
    fontSize: typography.sizes.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: typography.display.letterSpacing,
  },
  stats: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statCardHighlight: {
    borderColor: colors.orange,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  breakdown: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  breakdownTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
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
    color: colors.text,
  },
  breakdownValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
});
