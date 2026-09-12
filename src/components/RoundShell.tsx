import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { ROUND_DURATION } from '../constants/gameConfig';

export interface RoundShellProps {
  roundNumber: 1 | 2 | 3;
  roundName: string;
  roundColor: string;
  children: React.ReactNode;
  score: number;
  onTimeUp: () => void;
  showScore?: boolean;
  instruction?: string;
}

export function RoundShell({
  roundNumber,
  roundName,
  roundColor,
  children,
  score,
  onTimeUp,
  showScore = true,
  instruction,
}: RoundShellProps) {
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const timeLeftRef = useRef(ROUND_DURATION);
  const onTimeUpRef = useRef(onTimeUp);
  const hasEndedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const newTime = timeLeftRef.current;
      
      setTimeLeft(newTime);

      if (newTime === 10) {
        Vibration.vibrate(100);
      }

      if (newTime <= 0 && !hasEndedRef.current) {
        hasEndedRef.current = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onTimeUpRef.current();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const progress = timeLeft / ROUND_DURATION;
  const isLowTime = timeLeft <= 10;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.roundInfo}>
          <Text style={styles.roundLabel}>ROUND {roundNumber}/3</Text>
          <Text style={[styles.roundName, { color: roundColor }]}>{roundName}</Text>
        </View>
        <View style={styles.headerRight}>
          {showScore && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>SCORE</Text>
              <Text style={[styles.scoreValue, { color: roundColor }]}>{score}</Text>
            </View>
          )}
          <View style={[styles.timer, isLowTime && styles.timerLow, { borderColor: roundColor }]}>
            <Text style={[styles.timerText, isLowTime && styles.timerTextLow]}>
              {timeLeft}
            </Text>
            <Text style={[styles.timerUnit, isLowTime && styles.timerTextLow]}>SEC</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: roundColor },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      {instruction && (
        <View style={[styles.instructionContainer, { borderColor: roundColor }]}>
          <Text style={styles.instruction}>{instruction}</Text>
        </View>
      )}

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

export function useRoundScore(initialScore = 0) {
  const [score, setScore] = useState(initialScore);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const addScore = useCallback((points: number) => {
    const multiplier = 1 + Math.min(combo, 5) * 0.1;
    const finalPoints = Math.round(points * multiplier);
    setScore(prev => prev + finalPoints);
    setCombo(prev => prev + 1);
    setFeedback('correct');
    setTimeout(() => setFeedback(null), 200);
    Vibration.vibrate(50);
    return finalPoints;
  }, [combo]);

  const penalize = useCallback((points: number) => {
    setScore(prev => Math.max(0, prev - points));
    setCombo(0);
    setFeedback('wrong');
    setTimeout(() => setFeedback(null), 300);
    Vibration.vibrate([0, 100, 50, 100]);
  }, []);

  const resetCombo = useCallback(() => {
    setCombo(0);
  }, []);

  return { score, combo, feedback, addScore, penalize, resetCombo };
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
    fontWeight: '600',
  },
  roundName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.display.fontWeight,
    letterSpacing: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
  },
  timer: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
  },
  timerLow: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  timerText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  timerUnit: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
    fontWeight: '600',
  },
  timerTextLow: {
    color: colors.text,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  instructionContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
  },
  instruction: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
});
