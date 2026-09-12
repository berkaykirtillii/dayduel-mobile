import AsyncStorage from '@react-native-async-storage/async-storage';
import { DifficultyLevel } from '../constants/gameConfig';

export type { DifficultyLevel } from '../constants/gameConfig';

const DIFFICULTY_KEY = '@dayduel/difficulty';
const LAST_PERFORMANCE_KEY = '@dayduel/last_performance';

export interface PerformanceMetrics {
  echoAccuracy: number;
  snapAccuracy: number;
  lockAccuracy: number;
  totalScore: number;
}

export async function getDifficulty(): Promise<DifficultyLevel> {
  try {
    const stored = await AsyncStorage.getItem(DIFFICULTY_KEY);
    if (stored) {
      const level = parseInt(stored, 10) as DifficultyLevel;
      if (level >= 1 && level <= 5) return level;
    }
    return 2;
  } catch {
    return 2;
  }
}

export async function setDifficulty(level: DifficultyLevel): Promise<void> {
  try {
    await AsyncStorage.setItem(DIFFICULTY_KEY, level.toString());
  } catch (error) {
    console.error('Error saving difficulty:', error);
  }
}

export async function savePerformance(metrics: PerformanceMetrics): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_PERFORMANCE_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.error('Error saving performance:', error);
  }
}

export async function getLastPerformance(): Promise<PerformanceMetrics | null> {
  try {
    const stored = await AsyncStorage.getItem(LAST_PERFORMANCE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export async function adjustDifficultyAfterGame(
  metrics: PerformanceMetrics
): Promise<DifficultyLevel> {
  const currentDifficulty = await getDifficulty();
  const avgAccuracy = (metrics.echoAccuracy + metrics.snapAccuracy + metrics.lockAccuracy) / 3;
  
  let newDifficulty = currentDifficulty;
  
  if (avgAccuracy >= 0.85 && currentDifficulty < 5) {
    newDifficulty = (currentDifficulty + 1) as DifficultyLevel;
  } else if (avgAccuracy < 0.5 && currentDifficulty > 1) {
    newDifficulty = (currentDifficulty - 1) as DifficultyLevel;
  }
  
  if (newDifficulty !== currentDifficulty) {
    await setDifficulty(newDifficulty);
  }
  
  await savePerformance(metrics);
  
  return newDifficulty;
}
