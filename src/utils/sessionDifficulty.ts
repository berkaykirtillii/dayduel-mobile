/**
 * Session-Based Progressive Difficulty
 * 
 * Within a ~90s round, after a short warm-up (~10s), difficulty adapts:
 * - Step +1 on performance streaks (N correct / high accuracy window)
 * - Step -1 on miss streaks
 * - Clamp to soft min/max per game
 * 
 * This is SEPARATE from day-to-day adaptive baseline (difficulty.ts)
 */

import {
  ECHO_CONFIGS,
  SNAP_CONFIGS,
  LOCK_CONFIGS,
  DifficultyLevel,
  EchoConfig,
  SnapConfig,
  LockConfig,
} from '../constants/gameConfig';

export interface SessionDifficultyState {
  currentLevel: number;
  minLevel: number;
  maxLevel: number;
  correctStreak: number;
  missStreak: number;
  isWarmup: boolean;
  roundStartTime: number;
}

const WARMUP_DURATION_MS = 10000;
const STREAK_TO_INCREASE = 3;
const MISSES_TO_DECREASE = 2;

export function createSessionDifficultyState(
  baseDifficulty: DifficultyLevel,
  minLevel = 1,
  maxLevel = 5
): SessionDifficultyState {
  return {
    currentLevel: baseDifficulty,
    minLevel,
    maxLevel,
    correctStreak: 0,
    missStreak: 0,
    isWarmup: true,
    roundStartTime: Date.now(),
  };
}

export function updateSessionDifficulty(
  state: SessionDifficultyState,
  isCorrect: boolean
): SessionDifficultyState {
  const elapsed = Date.now() - state.roundStartTime;
  const isWarmup = elapsed < WARMUP_DURATION_MS;
  
  if (isWarmup) {
    return {
      ...state,
      isWarmup,
      correctStreak: isCorrect ? state.correctStreak + 1 : 0,
      missStreak: isCorrect ? 0 : state.missStreak + 1,
    };
  }
  
  let { currentLevel, correctStreak, missStreak } = state;
  
  if (isCorrect) {
    correctStreak += 1;
    missStreak = 0;
    
    if (correctStreak >= STREAK_TO_INCREASE && currentLevel < state.maxLevel) {
      currentLevel += 1;
      correctStreak = 0;
    }
  } else {
    missStreak += 1;
    correctStreak = 0;
    
    if (missStreak >= MISSES_TO_DECREASE && currentLevel > state.minLevel) {
      currentLevel -= 1;
      missStreak = 0;
    }
  }
  
  return {
    ...state,
    currentLevel,
    correctStreak,
    missStreak,
    isWarmup: false,
  };
}

export function getEchoConfigForSession(
  baseDifficulty: DifficultyLevel,
  sessionLevel: number
): EchoConfig {
  const baseConfig = ECHO_CONFIGS[baseDifficulty];
  const effectiveLevel = Math.max(1, Math.min(5, sessionLevel)) as DifficultyLevel;
  const targetConfig = ECHO_CONFIGS[effectiveLevel];
  
  const sequenceLength = Math.min(
    baseConfig.sequenceLength + (sessionLevel - baseDifficulty),
    8
  );
  
  return {
    ...targetConfig,
    sequenceLength: Math.max(3, Math.min(sequenceLength, 8)),
    flashDuration: Math.max(300, targetConfig.flashDuration),
    gapDuration: Math.max(100, targetConfig.gapDuration),
  };
}

export function getSnapConfigForSession(
  baseDifficulty: DifficultyLevel,
  sessionLevel: number
): SnapConfig {
  const effectiveLevel = Math.max(1, Math.min(5, sessionLevel)) as DifficultyLevel;
  const config = SNAP_CONFIGS[effectiveLevel];
  
  return {
    ...config,
    targetLifetimeMs: Math.max(600, config.targetLifetimeMs),
    spawnRateMs: Math.max(500, config.spawnRateMs),
    distractorRatio: Math.min(0.45, config.distractorRatio),
  };
}

export function getLockConfigForSession(
  baseDifficulty: DifficultyLevel,
  sessionLevel: number
): LockConfig {
  const effectiveLevel = Math.max(1, Math.min(5, sessionLevel)) as DifficultyLevel;
  const config = LOCK_CONFIGS[effectiveLevel];
  
  return {
    ...config,
    fallDurationMs: Math.max(2000, config.fallDurationMs),
    spawnIntervalMs: Math.max(500, config.spawnIntervalMs),
    distractorSimilarity: Math.min(0.75, config.distractorSimilarity),
    targetRatio: Math.max(0.35, Math.min(0.6, config.targetRatio)),
  };
}

export const SESSION_DIFFICULTY_PARAMS = {
  warmupDurationMs: WARMUP_DURATION_MS,
  streakToIncrease: STREAK_TO_INCREASE,
  missesToDecrease: MISSES_TO_DECREASE,
  echo: {
    sequenceLengthMin: 3,
    sequenceLengthMax: 8,
    flashDurationMin: 300,
    gapDurationMin: 100,
  },
  snap: {
    targetLifetimeMin: 600,
    spawnRateMin: 500,
    distractorRatioMax: 0.45,
  },
  lock: {
    fallDurationMin: 2000,
    spawnIntervalMin: 500,
    distractorSimilarityMax: 0.75,
  },
};
