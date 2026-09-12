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

export async function saveScore(score: number): Promise<void> {
  try {
    const today = new Date().toDateString();
    const currentState = await getGameState();
    
    await AsyncStorage.setItem(STORAGE_KEYS.SCORE, score.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_PLAYED, today);
    
    if (score > currentState.bestScore) {
      await AsyncStorage.setItem('@dayduel/best_score', score.toString());
    }
  } catch (error) {
    console.error('Error saving score:', error);
  }
}

export async function updateStreak(): Promise<number> {
  try {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const currentState = await getGameState();
    
    let newStreak = 1;
    
    if (currentState.lastPlayed === yesterday) {
      newStreak = currentState.streak + 1;
    } else if (currentState.lastPlayed === today) {
      newStreak = currentState.streak;
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 1;
  }
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
