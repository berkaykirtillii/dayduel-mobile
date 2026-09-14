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
import { colors, spacing, borderRadius, typography } from '../../src/constants/theme';
import {
  LOCK_CONFIGS,
  LOCK_RULES,
  SHAPES,
  SHAPE_COLORS,
  DifficultyLevel,
  Shape,
  ShapeColor,
  LockRule,
} from '../../src/constants/gameConfig';
import { getDifficulty, adjustDifficultyAfterGame } from '../../src/utils/difficulty';

const { width, height } = Dimensions.get('window');
const PLAY_AREA_HEIGHT = height * 0.55;
const SHAPE_SIZE = 55;

interface FallingShape {
  id: string;
  x: number;
  y: Animated.Value;
  shape: Shape;
  color: ShapeColor;
  isTarget: boolean;
  createdAt: number;
}

const ShapeComponent = ({
  shape,
  color,
  size,
  isTarget,
}: {
  shape: Shape;
  color: ShapeColor;
  size: number;
  isTarget: boolean;
}) => {
  const colorValue = SHAPE_COLORS[color];
  const fillColor = isTarget ? colorValue : 'transparent';
  const borderColor = colorValue;
  const borderWidth = isTarget ? 3 : 2;
  const opacity = isTarget ? 1 : 0.5;

  switch (shape) {
    case 'circle':
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: fillColor,
            borderWidth,
            borderColor,
            borderStyle: isTarget ? 'solid' : 'dashed',
            opacity,
          }}
        />
      );
    case 'square':
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: 4,
            backgroundColor: fillColor,
            borderWidth,
            borderColor,
            borderStyle: isTarget ? 'solid' : 'dashed',
            opacity,
          }}
        />
      );
    case 'triangle':
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: size / 2,
            borderRightWidth: size / 2,
            borderBottomWidth: size * 0.866,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: colorValue,
            opacity,
          }}
        />
      );
    case 'diamond':
      return (
        <View
          style={{
            width: size * 0.7,
            height: size * 0.7,
            backgroundColor: fillColor,
            borderWidth,
            borderColor,
            borderStyle: isTarget ? 'solid' : 'dashed',
            transform: [{ rotate: '45deg' }],
            opacity,
          }}
        />
      );
    default:
      return null;
  }
};

export default function LockRoundScreen() {
  const params = useLocalSearchParams<{
    totalScore?: string;
    echoScore?: string;
    snapScore?: string;
    duelId?: string;
  }>();
  const previousScore = parseInt(params.totalScore || '0', 10);
  const echoScore = params.echoScore || '0';
  const snapScore = params.snapScore || '0';
  const duelId = params.duelId || '';
  
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [config, setConfig] = useState(LOCK_CONFIGS[2]);
  const [rule, setRule] = useState<LockRule>(LOCK_RULES[0]);
  const [shapes, setShapes] = useState<FallingShape[]>([]);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [missed, setMissed] = useState(0);
  
  const { score, addScore, penalize } = useRoundScore();
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shapeIdRef = useRef(0);
  const isGameActiveRef = useRef(true);

  useEffect(() => {
    const init = async () => {
      const diff = await getDifficulty();
      setDifficulty(diff);
      setConfig(LOCK_CONFIGS[diff]);
      const randomRule = LOCK_RULES[Math.floor(Math.random() * LOCK_RULES.length)];
      setRule(randomRule);
    };
    init();
  }, []);

  const isShapeTarget = useCallback((shape: Shape, color: ShapeColor): boolean => {
    if (rule.shape && rule.color) {
      return shape === rule.shape && color === rule.color;
    }
    if (rule.shape) {
      return shape === rule.shape;
    }
    if (rule.color) {
      return color === rule.color;
    }
    return false;
  }, [rule]);

  const spawnShape = useCallback(() => {
    if (!isGameActiveRef.current) return;
    
    const id = `shape-${shapeIdRef.current++}`;
    const padding = SHAPE_SIZE / 2 + 10;
    const x = padding + Math.random() * (width - spacing.lg * 2 - padding * 2);
    
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const colorKeys = Object.keys(SHAPE_COLORS) as ShapeColor[];
    
    let color: ShapeColor;
    if (Math.random() < 0.4) {
      if (rule.color) {
        color = rule.color;
      } else {
        color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      }
    } else {
      color = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    }
    
    const isTarget = isShapeTarget(shape, color);
    const y = new Animated.Value(-SHAPE_SIZE);
    
    const newShape: FallingShape = {
      id,
      x,
      y,
      shape,
      color,
      isTarget,
      createdAt: Date.now(),
    };

    setShapes(prev => [...prev, newShape]);

    Animated.timing(y, {
      toValue: PLAY_AREA_HEIGHT + SHAPE_SIZE,
      duration: config.fallDurationMs,
      useNativeDriver: true,
    }).start(() => {
      handleShapeMissed(id, isTarget);
    });
  }, [config, rule, isShapeTarget]);

  const handleShapeMissed = useCallback((id: string, wasTarget: boolean) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    if (wasTarget && isGameActiveRef.current) {
      setMissed(m => m + 1);
      penalize(config.penaltyPerMiss);
    }
  }, [config, penalize]);

  const handleShapePress = useCallback((shape: FallingShape) => {
    setShapes(prev => prev.filter(s => s.id !== shape.id));
    
    if (shape.isTarget) {
      const timeSinceSpawn = Date.now() - shape.createdAt;
      const speedBonus = Math.max(0, Math.floor((config.fallDurationMs - timeSinceSpawn) / 200) * 10);
      addScore(config.pointsPerCorrect + speedBonus);
      setCorrect(c => c + 1);
    } else {
      penalize(config.penaltyPerWrong);
      setWrong(w => w + 1);
    }
  }, [config, addScore, penalize]);

  useEffect(() => {
    if (!config || !rule) return;
    
    spawnIntervalRef.current = setInterval(spawnShape, config.spawnIntervalMs);
    
    setTimeout(spawnShape, 300);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [config, rule, spawnShape]);

  const handleTimeUp = useCallback(async () => {
    isGameActiveRef.current = false;
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }
    
    const finalScore = previousScore + score;
    
    const echoAcc = 0.7;
    const snapAcc = 0.7;
    const lockAcc = correct + wrong + missed > 0 
      ? correct / (correct + wrong + missed) 
      : 0.5;
    
    await adjustDifficultyAfterGame({
      echoAccuracy: echoAcc,
      snapAccuracy: snapAcc,
      lockAccuracy: lockAcc,
      totalScore: finalScore,
    });
    
    router.replace({
      pathname: '/result',
      params: {
        duelId,
        score: finalScore.toString(),
        echoScore,
        snapScore,
        lockScore: score.toString(),
      },
    });
  }, [previousScore, score, echoScore, snapScore, correct, wrong, missed]);

  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 100;

  return (
    <RoundShell
      roundNumber={3}
      roundName="LOCK"
      roundColor={colors.text}
      score={score}
      onTimeUp={handleTimeUp}
    >
      <View style={styles.content}>
        <View style={styles.ruleContainer}>
          <Text style={styles.ruleLabel}>TAP ONLY:</Text>
          <Text style={styles.ruleText}>{rule.description}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correct}</Text>
            <Text style={styles.statLabel}>CORRECT</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>ACCURACY</Text>
          </View>
        </View>
        
        <View style={[styles.playArea, { height: PLAY_AREA_HEIGHT }]}>
          {shapes.map(shape => (
            <Animated.View
              key={shape.id}
              style={[
                styles.shapeContainer,
                {
                  left: shape.x - SHAPE_SIZE / 2,
                  transform: [{ translateY: shape.y }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.shapeTouch}
                onPress={() => handleShapePress(shape)}
                activeOpacity={0.7}
              >
                <ShapeComponent
                  shape={shape.shape}
                  color={shape.color}
                  size={SHAPE_SIZE}
                  isTarget={shape.isTarget}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
          
          <View style={styles.tapZone}>
            <Text style={styles.tapZoneText}>TAP ZONE</Text>
          </View>
        </View>
      </View>
    </RoundShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  ruleContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.magenta,
  },
  ruleLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  ruleText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.magenta,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xs,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    letterSpacing: 1,
  },
  playArea: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  shapeContainer: {
    position: 'absolute',
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeTouch: {
    width: SHAPE_SIZE + 20,
    height: SHAPE_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapZone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255, 45, 149, 0.1)',
    borderTopWidth: 2,
    borderTopColor: colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapZoneText: {
    fontSize: typography.sizes.xs,
    color: colors.magenta,
    letterSpacing: 2,
    opacity: 0.7,
  },
});
