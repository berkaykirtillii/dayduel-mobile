import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { ROUND_DURATION } from '../constants/gameConfig';
import { 
  warningNotification, 
  heavyImpact, 
  successNotification, 
  errorNotification 
} from '../utils/haptics';

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
        warningNotification();
      }
      
      if (newTime === 3) {
        heavyImpact();
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

  const timerGradientColors = isLowTime 
    ? [colors.error, '#CC3333'] as const
    : [colors.card, colors.cardBorder] as const;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.roundInfo}>
          <View style={styles.roundBadge}>
            <Text style={styles.roundLabel}>{roundNumber}/3</Text>
          </View>
          <Text style={[styles.roundName, { color: roundColor }]}>{roundName}</Text>
        </View>
        <View style={styles.headerRight}>
          {showScore && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
              <Text style={styles.scoreLabel}>PTS</Text>
            </View>
          )}
          <LinearGradient
            colors={timerGradientColors}
            style={[styles.timer, isLowTime && styles.timerLow]}
          >
            <Text style={[styles.timerText, isLowTime && styles.timerTextLow]}>
              {timeLeft}
            </Text>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[roundColor, `${roundColor}99`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        {isLowTime && (
          <View style={styles.progressPulse} />
        )}
      </View>

      {instruction && (
        <View style={[styles.instructionContainer, { borderLeftColor: roundColor }]}>
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
    successNotification();
    return finalPoints;
  }, [combo]);

  const penalize = useCallback((points: number) => {
    setScore(prev => Math.max(0, prev - points));
    setCombo(0);
    setFeedback('wrong');
    setTimeout(() => setFeedback(null), 300);
    errorNotification();
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  roundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roundBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roundLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 1,
  },
  roundName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  timer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLow: {
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  timerText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  timerTextLow: {
    color: colors.text,
  },
  progressContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    position: 'relative',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPulse: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  instructionContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
  },
  instruction: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  content: {
    flex: 1,
  },
});
