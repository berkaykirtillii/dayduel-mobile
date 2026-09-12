import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ViewStyle,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { RoundShell, useRoundScore } from '../../src/components';
import { colors, spacing, borderRadius, typography } from '../../src/constants/theme';
import { ECHO_CONFIGS, DifficultyLevel } from '../../src/constants/gameConfig';
import { getDifficulty } from '../../src/utils/difficulty';
import { lightImpact, mediumImpact } from '../../src/utils/haptics';

const { width } = Dimensions.get('window');

type GamePhase = 'showing' | 'input' | 'feedback' | 'next';

export default function EchoRoundScreen() {
  const params = useLocalSearchParams<{ totalScore?: string; duelId?: string }>();
  const previousScore = parseInt(params.totalScore || '0', 10);
  const duelId = params.duelId || '';
  
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [config, setConfig] = useState(ECHO_CONFIGS[2]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<GamePhase>('showing');
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [feedbackCell, setFeedbackCell] = useState<{ index: number; correct: boolean } | null>(null);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [round, setRound] = useState(1);
  
  const { score, addScore, penalize, feedback } = useRoundScore();
  const isInitializedRef = useRef(false);
  const showingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const init = async () => {
      const diff = await getDifficulty();
      setDifficulty(diff);
      setConfig(ECHO_CONFIGS[diff]);
    };
    init();
  }, []);

  const generateSequence = useCallback((length: number, gridSize: number) => {
    const totalCells = gridSize * gridSize;
    const newSequence: number[] = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * totalCells));
    }
    return newSequence;
  }, []);

  const startNewSequence = useCallback(() => {
    const seqLength = Math.min(config.sequenceLength + Math.floor(round / 3), 8);
    const newSeq = generateSequence(seqLength, config.gridSize);
    setSequence(newSeq);
    setPlayerInput([]);
    setPhase('showing');
    setSequenceIndex(0);
  }, [config.sequenceLength, config.gridSize, round, generateSequence]);

  useEffect(() => {
    if (!isInitializedRef.current && config) {
      isInitializedRef.current = true;
      startNewSequence();
    }
  }, [config, startNewSequence]);

  useEffect(() => {
    if (phase !== 'showing' || sequence.length === 0) return;

    if (sequenceIndex < sequence.length) {
      setActiveCell(sequence[sequenceIndex]);
      
      showingTimeoutRef.current = setTimeout(() => {
        setActiveCell(null);
        
        showingTimeoutRef.current = setTimeout(() => {
          setSequenceIndex(prev => prev + 1);
        }, config.gapDuration);
      }, config.flashDuration);
    } else {
      setPhase('input');
    }

    return () => {
      if (showingTimeoutRef.current) {
        clearTimeout(showingTimeoutRef.current);
      }
    };
  }, [phase, sequenceIndex, sequence, config.flashDuration, config.gapDuration]);

  const handleCellPress = useCallback((index: number) => {
    if (phase !== 'input') return;

    const expectedIndex = playerInput.length;
    const isCorrect = sequence[expectedIndex] === index;

    setFeedbackCell({ index, correct: isCorrect });
    setTimeout(() => setFeedbackCell(null), 150);

    if (isCorrect) {
      const newInput = [...playerInput, index];
      setPlayerInput(newInput);

      if (newInput.length === sequence.length) {
        const bonusPoints = config.pointsPerCorrect * sequence.length;
        addScore(bonusPoints);
        setPhase('next');
        
        setTimeout(() => {
          setRound(prev => prev + 1);
          startNewSequence();
        }, 500);
      } else {
        addScore(config.pointsPerCorrect);
      }
    } else {
      penalize(config.penaltyPerMiss);
      setPhase('next');
      
      setTimeout(() => {
        startNewSequence();
      }, 800);
    }
  }, [phase, playerInput, sequence, config, addScore, penalize, startNewSequence]);

  const handleTimeUp = useCallback(() => {
    const newTotalScore = previousScore + score;
    router.replace({
      pathname: '/game/snap',
      params: {
        duelId,
        totalScore: newTotalScore.toString(),
        echoScore: score.toString(),
      },
    });
  }, [previousScore, score, duelId]);

  const gridSize = config.gridSize;
  const cellSize = (width - spacing.lg * 2 - spacing.sm * (gridSize - 1)) / gridSize;

  const renderCell = (index: number) => {
    const isActive = activeCell === index;
    const isFeedback = feedbackCell?.index === index;
    const feedbackCorrect = feedbackCell?.correct;
    
    const cellStyles: ViewStyle[] = [
      styles.cell, 
      { width: cellSize, height: cellSize },
    ];
    
    if (isActive) {
      cellStyles.push(styles.cellActive);
    } else if (isFeedback) {
      cellStyles.push(feedbackCorrect ? styles.cellCorrect : styles.cellWrong);
    }

    const handlePress = () => {
      lightImpact();
      handleCellPress(index);
    };

    return (
      <TouchableOpacity
        key={index}
        style={cellStyles}
        onPress={handlePress}
        disabled={phase !== 'input'}
        activeOpacity={0.7}
      >
        {isActive && (
          <LinearGradient
            colors={[colors.orangeLight, colors.orange]}
            style={styles.cellGlow}
          />
        )}
        {isFeedback && feedbackCorrect && (
          <View style={styles.cellSuccessRing} />
        )}
      </TouchableOpacity>
    );
  };

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      cells.push(renderCell(i));
    }

    return (
      <View style={[styles.grid, { width: width - spacing.lg * 2 }]}>
        {cells}
      </View>
    );
  };

  const getInstruction = () => {
    if (phase === 'showing') {
      return `Watch the sequence... (${sequenceIndex + 1}/${sequence.length})`;
    }
    if (phase === 'input') {
      return `Tap the pattern! (${playerInput.length}/${sequence.length})`;
    }
    return 'Get ready...';
  };

  return (
    <RoundShell
      roundNumber={1}
      roundName="ECHO"
      roundColor={colors.orange}
      score={score}
      onTimeUp={handleTimeUp}
      instruction={getInstruction()}
    >
      <View style={styles.content}>
        <View style={styles.roundIndicator}>
          <Text style={styles.roundText}>Pattern #{round}</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>L{difficulty}</Text>
          </View>
        </View>
        
        {renderGrid()}
        
        <View style={styles.progressDots}>
          {sequence.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < playerInput.length && styles.dotFilled,
                phase === 'showing' && i === sequenceIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </RoundShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  roundIndicator: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roundText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    letterSpacing: 1,
  },
  difficultyBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  difficultyText: {
    fontSize: typography.sizes.xs,
    color: colors.orange,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  cell: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orangeLight,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  cellCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  cellWrong: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  cellGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md - 2,
  },
  cellSuccessRing: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.text,
    opacity: 0.5,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dotFilled: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  dotActive: {
    backgroundColor: colors.orangeLight,
    borderColor: colors.orange,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
