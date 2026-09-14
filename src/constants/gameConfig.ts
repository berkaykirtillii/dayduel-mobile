/**
 * Game Configuration - Difficulty settings and knobs for each round
 */

export interface EchoConfig {
  gridSize: number;
  sequenceLength: number;
  flashDuration: number;
  gapDuration: number;
  pointsPerCorrect: number;
  penaltyPerMiss: number;
}

export interface SnapConfig {
  spawnRateMs: number;
  targetLifetimeMs: number;
  distractorRatio: number;
  pointsPerTarget: number;
  penaltyPerDistractor: number;
  maxTargetsOnScreen: number;
}

export interface LockConfig {
  spawnIntervalMs: number;
  fallDurationMs: number;
  distractorSimilarity: number;
  reactionWindowMs: number;
  pointsPerCorrect: number;
  penaltyPerMiss: number;
  penaltyPerWrong: number;
  targetRatio: number;
}

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export const ECHO_CONFIGS: Record<DifficultyLevel, EchoConfig> = {
  1: {
    gridSize: 3,
    sequenceLength: 3,
    flashDuration: 600,
    gapDuration: 300,
    pointsPerCorrect: 100,
    penaltyPerMiss: 0,
  },
  2: {
    gridSize: 3,
    sequenceLength: 4,
    flashDuration: 500,
    gapDuration: 250,
    pointsPerCorrect: 120,
    penaltyPerMiss: 0,
  },
  3: {
    gridSize: 3,
    sequenceLength: 5,
    flashDuration: 450,
    gapDuration: 200,
    pointsPerCorrect: 150,
    penaltyPerMiss: 0,
  },
  4: {
    gridSize: 4,
    sequenceLength: 5,
    flashDuration: 400,
    gapDuration: 200,
    pointsPerCorrect: 180,
    penaltyPerMiss: 0,
  },
  5: {
    gridSize: 4,
    sequenceLength: 6,
    flashDuration: 350,
    gapDuration: 150,
    pointsPerCorrect: 200,
    penaltyPerMiss: 0,
  },
};

export const SNAP_CONFIGS: Record<DifficultyLevel, SnapConfig> = {
  1: {
    spawnRateMs: 1200,
    targetLifetimeMs: 1500,
    distractorRatio: 0.2,
    pointsPerTarget: 50,
    penaltyPerDistractor: 25,
    maxTargetsOnScreen: 3,
  },
  2: {
    spawnRateMs: 1000,
    targetLifetimeMs: 1300,
    distractorRatio: 0.25,
    pointsPerTarget: 60,
    penaltyPerDistractor: 30,
    maxTargetsOnScreen: 4,
  },
  3: {
    spawnRateMs: 850,
    targetLifetimeMs: 1100,
    distractorRatio: 0.3,
    pointsPerTarget: 75,
    penaltyPerDistractor: 35,
    maxTargetsOnScreen: 5,
  },
  4: {
    spawnRateMs: 700,
    targetLifetimeMs: 950,
    distractorRatio: 0.35,
    pointsPerTarget: 90,
    penaltyPerDistractor: 40,
    maxTargetsOnScreen: 6,
  },
  5: {
    spawnRateMs: 600,
    targetLifetimeMs: 800,
    distractorRatio: 0.4,
    pointsPerTarget: 100,
    penaltyPerDistractor: 50,
    maxTargetsOnScreen: 7,
  },
};

export const LOCK_CONFIGS: Record<DifficultyLevel, LockConfig> = {
  1: {
    spawnIntervalMs: 1000,
    fallDurationMs: 3800,
    distractorSimilarity: 0.3,
    reactionWindowMs: 800,
    pointsPerCorrect: 75,
    penaltyPerMiss: 25,
    penaltyPerWrong: 50,
    targetRatio: 0.55,
  },
  2: {
    spawnIntervalMs: 850,
    fallDurationMs: 3400,
    distractorSimilarity: 0.4,
    reactionWindowMs: 700,
    pointsPerCorrect: 90,
    penaltyPerMiss: 30,
    penaltyPerWrong: 60,
    targetRatio: 0.50,
  },
  3: {
    spawnIntervalMs: 750,
    fallDurationMs: 3000,
    distractorSimilarity: 0.5,
    reactionWindowMs: 600,
    pointsPerCorrect: 100,
    penaltyPerMiss: 35,
    penaltyPerWrong: 70,
    targetRatio: 0.45,
  },
  4: {
    spawnIntervalMs: 650,
    fallDurationMs: 2700,
    distractorSimilarity: 0.55,
    reactionWindowMs: 500,
    pointsPerCorrect: 120,
    penaltyPerMiss: 40,
    penaltyPerWrong: 80,
    targetRatio: 0.42,
  },
  5: {
    spawnIntervalMs: 550,
    fallDurationMs: 2400,
    distractorSimilarity: 0.6,
    reactionWindowMs: 450,
    pointsPerCorrect: 150,
    penaltyPerMiss: 50,
    penaltyPerWrong: 100,
    targetRatio: 0.40,
  },
};

export const ROUND_DURATION = 90;

export const SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const;
export type Shape = typeof SHAPES[number];

export const SHAPE_COLORS = {
  orange: '#FF5A1F',
  magenta: '#FF2D95',
  cyan: '#00D9FF',
  lime: '#84CC16',
} as const;
export type ShapeColor = keyof typeof SHAPE_COLORS;

export interface LockRule {
  shape?: Shape;
  color?: ShapeColor;
  description: string;
}

export const LOCK_RULES: LockRule[] = [
  { color: 'magenta', description: 'Only MAGENTA shapes' },
  { color: 'orange', description: 'Only ORANGE shapes' },
  { shape: 'circle', description: 'Only CIRCLES' },
  { shape: 'square', description: 'Only SQUARES' },
  { shape: 'circle', color: 'magenta', description: 'Only MAGENTA CIRCLES' },
  { shape: 'square', color: 'orange', description: 'Only ORANGE SQUARES' },
];
