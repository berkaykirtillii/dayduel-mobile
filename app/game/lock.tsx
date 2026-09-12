import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';

const ROUND_DURATION = 90;

export default function LockRoundScreen() {
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [score, setScore] = useState(0);
  const params = useLocalSearchParams<{ totalScore?: string }>();
  const previousScore = parseInt(params.totalScore || '0', 10);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleComplete();
    }
  }, [timeLeft]);

  const handleComplete = () => {
    const finalScore = previousScore + score;
    router.replace({
      pathname: '/result',
      params: { score: finalScore.toString() },
    });
  };

  const handleTap = () => {
    setScore(prev => prev + 75);
  };

  const progress = timeLeft / ROUND_DURATION;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.roundInfo}>
          <Text style={styles.roundLabel}>ROUND 3</Text>
          <Text style={styles.roundName}>LOCK</Text>
        </View>
        <View style={styles.timer}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>🎯 Focus Round</Text>
        <Text style={styles.description}>
          Stay focused and hit the targets.{'\n'}
          (Placeholder - game logic coming soon)
        </Text>

        <TouchableOpacity style={styles.tapArea} onPress={handleTap}>
          <Text style={styles.tapText}>TAP TO SCORE</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button title="FINISH DUEL" onPress={handleComplete} variant="ghost" />
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
  roundInfo: {},
  roundLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    letterSpacing: 2,
  },
  roundName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 2,
  },
  timer: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  timerText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  instruction: {
    fontSize: typography.sizes.xxl,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  tapArea: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    letterSpacing: 2,
  },
  scoreText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
});
