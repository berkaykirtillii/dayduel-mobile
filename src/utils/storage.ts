import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SCORE: '@dayduel/today_score',
  STREAK: '@dayduel/streak',
  LAST_PLAYED: '@dayduel/last_played',
  ONBOARDING_COMPLETE: '@dayduel/onboarding_complete',
  IS_PRO: '@dayduel/is_pro',
  DUELS_TODAY: '@dayduel/duels_today',
} as const;

export interface GameState {
  todayScore: number;
  streak: number;
  bestScore: number;
  lastPlayed: string | null;
  onboardingComplete: boolean;
  isPro: boolean;
  duelsToday: number;
}

const DEFAULT_STATE: GameState = {
  todayScore: 0,
  streak: 0,
  bestScore: 0,
  lastPlayed: null,
  onboardingComplete: false,
  isPro: false,
  duelsToday: 0,
};

export async function getGameState(): Promise<GameState> {
  try {
    const [
      todayScore,
      streak,
      bestScore,
      lastPlayed,
      onboardingComplete,
      isPro,
      duelsToday,
    ] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.SCORE),
      AsyncStorage.getItem(STORAGE_KEYS.STREAK),
      AsyncStorage.getItem('@dayduel/best_score'),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAYED),
      AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
      AsyncStorage.getItem(STORAGE_KEYS.IS_PRO),
      AsyncStorage.getItem(STORAGE_KEYS.DUELS_TODAY),
    ]);

    const today = new Date().toDateString();
    const isNewDay = lastPlayed !== today;

    return {
      todayScore: isNewDay ? 0 : parseInt(todayScore || '0', 10),
      streak: parseInt(streak || '0', 10),
      bestScore: parseInt(bestScore || '0', 10),
      lastPlayed: lastPlayed,
      onboardingComplete: onboardingComplete === 'true',
      isPro: isPro === 'true',
      duelsToday: isNewDay ? 0 : parseInt(duelsToday || '0', 10),
    };
  } catch (error) {
    console.error('Error loading game state:', error);
    return DEFAULT_STATE;
  }
}

export async function updateStreakAndSaveScore(score: number): Promise<{
  newStreak: number;
  newBestScore: number;
  duelsToday: number;
}> {
  try {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const [
      storedStreak,
      storedBestScore,
      storedLastPlayed,
      storedDuelsToday,
    ] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.STREAK),
      AsyncStorage.getItem('@dayduel/best_score'),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAYED),
      AsyncStorage.getItem(STORAGE_KEYS.DUELS_TODAY),
    ]);
    
    const currentStreak = parseInt(storedStreak || '0', 10);
    const currentBestScore = parseInt(storedBestScore || '0', 10);
    const isNewDay = storedLastPlayed !== today;
    const currentDuelsToday = isNewDay ? 0 : parseInt(storedDuelsToday || '0', 10);
    
    let newStreak = currentStreak;
    if (storedLastPlayed === yesterday) {
      newStreak = currentStreak + 1;
    } else if (storedLastPlayed !== today && storedLastPlayed !== null) {
      newStreak = 1;
    } else if (storedLastPlayed === null) {
      newStreak = 1;
    }
    
    const newBestScore = Math.max(currentBestScore, score);
    const newDuelsToday = currentDuelsToday + 1;
    
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.SCORE, score.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_PLAYED, today),
      AsyncStorage.setItem('@dayduel/best_score', newBestScore.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.DUELS_TODAY, newDuelsToday.toString()),
    ]);
    
    return { newStreak, newBestScore, duelsToday: newDuelsToday };
  } catch (error) {
    console.error('Error saving score and streak:', error);
    return { newStreak: 1, newBestScore: score, duelsToday: 1 };
  }
}

export async function saveScore(score: number): Promise<void> {
  await updateStreakAndSaveScore(score);
}

export async function updateStreak(): Promise<number> {
  const result = await updateStreakAndSaveScore(0);
  return result.newStreak;
}

export async function incrementDuelsToday(): Promise<number> {
  try {
    const currentState = await getGameState();
    const newCount = currentState.duelsToday + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.DUELS_TODAY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing duels:', error);
    return 1;
  }
}

export async function canPlayFreeDuel(): Promise<boolean> {
  const state = await getGameState();
  return state.isPro || state.duelsToday < 1;
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
  }
}

export async function setProStatus(isPro: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_PRO, isPro.toString());
  } catch (error) {
    console.error('Error setting pro status:', error);
  }
}

export async function resetGameState(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
    await AsyncStorage.removeItem('@dayduel/best_score');
  } catch (error) {
    console.error('Error resetting game state:', error);
  }
}
