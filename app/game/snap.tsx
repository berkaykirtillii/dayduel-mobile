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
import { SNAP_CONFIGS, DifficultyLevel } from '../../src/constants/gameConfig';
import { getDifficulty } from '../../src/utils/difficulty';

const { width, height } = Dimensions.get('window');
const PLAY_AREA_HEIGHT = height * 0.6;
const TARGET_SIZE = 70;

interface Target {
  id: string;
  x: number;
  y: number;
  isDistractor: boolean;
  opacity: Animated.Value;
  scale: Animated.Value;
  createdAt: number;
}

export default function SnapRoundScreen() {
  const params = useLocalSearchParams<{
    totalScore?: string;
    echoScore?: string;
    duelId?: string;
  }>();
  const previousScore = parseInt(params.totalScore || '0', 10);
  const echoScore = params.echoScore || '0';
  const duelId = params.duelId || '';
  
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [config, setConfig] = useState(SNAP_CONFIGS[2]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  
  const { score, addScore, penalize, feedback } = useRoundScore();
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetIdRef = useRef(0);
  const isGameActiveRef = useRef(true);

  useEffect(() => {
    const init = async () => {
      const diff = await getDifficulty();
      setDifficulty(diff);
      setConfig(SNAP_CONFIGS[diff]);
    };
    init();
  }, []);

  const spawnTarget = useCallback(() => {
    if (!isGameActiveRef.current) return;
    
    const isDistractor = Math.random() < config.distractorRatio;
    const id = `target-${targetIdRef.current++}`;
    
    const padding = TARGET_SIZE / 2 + 20;
    const x = padding + Math.random() * (width - spacing.lg * 2 - padding * 2);
    const y = padding + Math.random() * (PLAY_AREA_HEIGHT - padding * 2);
    
    const opacity = new Animated.Value(0);
    const scale = new Animated.Value(0.5);
    
    const newTarget: Target = {
      id,
      x,
      y,
      isDistractor,
      opacity,
      scale,
      createdAt: Date.now(),
    };

    setTargets(prev => {
      if (prev.length >= config.maxTargetsOnScreen) {
        return prev;
      }
      return [...prev, newTarget];
    });

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      removeTarget(id, true);
    }, config.targetLifetimeMs);
  }, [config]);

  const removeTarget = useCallback((id: string, expired = false) => {
    setTargets(prev => {
      const target = prev.find(t => t.id === id);
      if (!target) return prev;

      Animated.timing(target.opacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();

      return prev.filter(t => t.id !== id);
    });
    
    if (expired) {
      setTargets(prev => {
        const target = prev.find(t => t.id === id);
        if (target && !target.isDistractor) {
          setMisses(m => m + 1);
        }
        return prev.filter(t => t.id !== id);
      });
    }
  }, []);

  const handleTargetPress = useCallback((target: Target) => {
    if (target.isDistractor) {
      penalize(config.penaltyPerDistractor);
      setMisses(m => m + 1);
    } else {
      const timeSinceSpawn = Date.now() - target.createdAt;
      const speedBonus = Math.max(0, Math.floor((config.targetLifetimeMs - timeSinceSpawn) / 100) * 5);
      addScore(config.pointsPerTarget + speedBonus);
      setHits(h => h + 1);
    }
    
    removeTarget(target.id);
  }, [config, addScore, penalize, removeTarget]);

  useEffect(() => {
    if (!config) return;
    
    spawnIntervalRef.current = setInterval(spawnTarget, config.spawnRateMs);
    
    setTimeout(spawnTarget, 500);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [config, spawnTarget]);

  const handleTimeUp = useCallback(() => {
    isGameActiveRef.current = false;
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }
    
    const newTotalScore = previousScore + score;
    router.replace({
      pathname: '/game/lock',
      params: {
        duelId,
        totalScore: newTotalScore.toString(),
        echoScore,
        snapScore: score.toString(),
      },
    });
  }, [previousScore, score, echoScore, duelId]);

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 100;

  return (
    <RoundShell
      roundNumber={2}
      roundName="SNAP"
      roundColor={colors.magenta}
      score={score}
      onTimeUp={handleTimeUp}
      instruction="Tap ORANGE targets! Avoid gray distractors."
    >
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{hits}</Text>
            <Text style={styles.statLabel}>HITS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>ACCURACY</Text>
          </View>
        </View>
        
        <View style={[styles.playArea, { height: PLAY_AREA_HEIGHT }]}>
          {targets.map(target => (
            <Animated.View
              key={target.id}
              style={[
                styles.targetContainer,
                {
                  left: target.x - TARGET_SIZE / 2,
                  top: target.y - TARGET_SIZE / 2,
                  opacity: target.opacity,
                  transform: [{ scale: target.scale }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.target,
                  target.isDistractor ? styles.distractor : styles.realTarget,
                ]}
                onPress={() => handleTargetPress(target)}
                activeOpacity={0.7}
              >
                {!target.isDistractor && (
                  <View style={styles.targetInner} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
          
          {targets.length === 0 && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>Get ready...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendTarget]} />
            <Text style={styles.legendText}>Target (+{config.pointsPerTarget})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDistractor]} />
            <Text style={styles.legendText}>Avoid (-{config.penaltyPerDistractor})</Text>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.sm,
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
  targetContainer: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
  },
  target: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  realTarget: {
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  distractor: {
    backgroundColor: colors.mutedDark,
    borderWidth: 2,
    borderColor: colors.muted,
  },
  targetInner: {
    width: TARGET_SIZE * 0.4,
    height: TARGET_SIZE * 0.4,
    borderRadius: TARGET_SIZE * 0.2,
    backgroundColor: colors.orangeLight,
  },
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    fontSize: typography.sizes.lg,
    color: colors.muted,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendTarget: {
    backgroundColor: colors.orange,
  },
  legendDistractor: {
    backgroundColor: colors.mutedDark,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
});
