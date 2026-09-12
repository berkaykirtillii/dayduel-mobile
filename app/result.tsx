import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, StatCard } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    score?: string;
    echoScore?: string;
    snapScore?: string;
    lockScore?: string;
  }>();
  const score = parseInt(params.score || '0', 10);
  const echoScore = params.echoScore ? parseInt(params.echoScore, 10) : null;
  const snapScore = params.snapScore ? parseInt(params.snapScore, 10) : null;
  const lockScore = params.lockScore ? parseInt(params.lockScore, 10) : null;
  
  const { submitScore, bestScore, streak, checkCanPlay, isPro } = useGameState();
  const [newStreak, setNewStreak] = useState(streak);
  const [isNewBest, setIsNewBest] = useState(false);
  const [canPlayMore, setCanPlayMore] = useState(false);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    const saveResult = async () => {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;
      
      const result = await submitScore(score);
      if (!result.alreadySubmitted) {
        setNewStreak(result.streak);
        setIsNewBest(score > bestScore);
      }
      
      const canPlay = await checkCanPlay();
      setCanPlayMore(canPlay);
    };
    saveResult();
  }, []);

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
      <View style={styles.content}>
        <Text style={styles.title}>DUEL COMPLETE</Text>
        
        {isNewBest && (
          <View style={styles.newBestBadge}>
            <Text style={styles.newBestText}>🏆 NEW BEST!</Text>
          </View>
        )}

        <LinearGradient
          colors={[colors.orangeLight, colors.orange, colors.orangeDark]}
          style={styles.scoreContainer}
        >
          <Text style={styles.scoreLabel}>TODAY'S SCORE</Text>
          <Text style={styles.score}>{score.toLocaleString()}</Text>
        </LinearGradient>

        <View style={styles.stats}>
          <StatCard label="Streak" value={`${newStreak} days`} variant="highlight" />
          <View style={styles.statGap} />
          <StatCard label="Best" value={bestScore.toLocaleString()} />
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>ROUND BREAKDOWN</Text>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>🧠 Echo (Memory)</Text>
            <Text style={styles.breakdownValue}>
              {echoScore !== null ? echoScore.toLocaleString() : '--'}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>⚡ Snap (Reflex)</Text>
            <Text style={styles.breakdownValue}>
              {snapScore !== null ? snapScore.toLocaleString() : '--'}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>🎯 Lock (Focus)</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 4,
    marginBottom: spacing.lg,
  },
  newBestBadge: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  newBestText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.text,
  },
  scoreContainer: {
    width: '100%',
    paddingVertical: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.8,
    letterSpacing: 2,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.xl,
  },
  statGap: {
    width: spacing.md,
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
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
