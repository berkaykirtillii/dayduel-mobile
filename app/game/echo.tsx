import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { RoundShell, useRoundScore } from '../../src/components';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { ECHO_CONFIGS, DifficultyLevel } from '../../src/constants/gameConfig';
import { getDifficulty } from '../../src/utils/difficulty';

const { width } = Dimensions.get('window');

type GamePhase = 'showing' | 'input' | 'feedback' | 'next';

export default function EchoRoundScreen() {
  const params = useLocalSearchParams<{ totalScore?: string; difficulty?: string }>();
  const previousScore = parseInt(params.totalScore || '0', 10);
  
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
        totalScore: newTotalScore.toString(),
        echoScore: score.toString(),
      },
    });
  }, [previousScore, score]);

  const gridSize = config.gridSize;
  const cellSize = (width - spacing.lg * 2 - spacing.sm * (gridSize - 1)) / gridSize;

  const renderCell = (index: number) => {
    const isActive = activeCell === index;
    const isFeedback = feedbackCell?.index === index;
    const feedbackCorrect = feedbackCell?.correct;
    
    let cellStyle = [styles.cell, { width: cellSize, height: cellSize }];
    
    if (isActive) {
      cellStyle.push(styles.cellActive as any);
    } else if (isFeedback) {
      cellStyle.push(feedbackCorrect ? styles.cellCorrect as any : styles.cellWrong as any);
    }

    return (
      <TouchableOpacity
        key={index}
        style={cellStyle}
        onPress={() => handleCellPress(index)}
        disabled={phase !== 'input'}
        activeOpacity={0.7}
      >
        {isActive && <View style={styles.cellGlow} />}
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
    paddingHorizontal: spacing.lg,
  },
  roundIndicator: {
    marginBottom: spacing.lg,
  },
  roundText: {
    fontSize: 14,
    color: colors.muted,
    letterSpacing: 1,
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
    borderColor: colors.orange,
  },
  cellCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  cellWrong: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  cellGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.orangeLight,
    opacity: 0.5,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  },
});
