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
  const onTimeUpRef = useRef(onTimeUp);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (timeLeft <= 0 && !hasEndedRef.current) {
      hasEndedRef.current = true;
      onTimeUpRef.current();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        if (prev === 11) {
          Vibration.vibrate(100);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progress = timeLeft / ROUND_DURATION;
  const isLowTime = timeLeft <= 10;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.roundInfo}>
          <Text style={styles.roundLabel}>ROUND {roundNumber}</Text>
          <Text style={[styles.roundName, { color: roundColor }]}>{roundName}</Text>
        </View>
        <View style={styles.headerRight}>
          {showScore && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>SCORE</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
          )}
          <View style={[styles.timer, isLowTime && styles.timerLow]}>
            <Text style={[styles.timerText, isLowTime && styles.timerTextLow]}>
              {timeLeft}s
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: roundColor },
          ]}
        />
      </View>

      {instruction && (
        <View style={styles.instructionContainer}>
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
    paddingVertical: spacing.sm,
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
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  timer: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  timerLow: {
    backgroundColor: colors.error,
  },
  timerText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  timerTextLow: {
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
    borderRadius: 2,
  },
  instructionContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  instruction: {
    fontSize: typography.sizes.md,
    color: colors.muted,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});
