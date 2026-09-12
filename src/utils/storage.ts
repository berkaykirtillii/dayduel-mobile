import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SCORE: '@dayduel/today_score',
  BEST_SCORE: '@dayduel/best_score',
  STREAK: '@dayduel/streak',
  LAST_PLAYED: '@dayduel/last_played',
  ONBOARDING_COMPLETE: '@dayduel/onboarding_complete',
  IS_PRO: '@dayduel/is_pro',
  DUELS_TODAY: '@dayduel/duels_today',
  LAST_DUEL_ID: '@dayduel/last_duel_id',
  DEV_UNLIMITED: '@dayduel/dev_unlimited',
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

function getTodayString(): string {
  return new Date().toDateString();
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toDateString();
}

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
      AsyncStorage.getItem(STORAGE_KEYS.BEST_SCORE),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAYED),
      AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
      AsyncStorage.getItem(STORAGE_KEYS.IS_PRO),
      AsyncStorage.getItem(STORAGE_KEYS.DUELS_TODAY),
    ]);

    const today = getTodayString();
    const isNewDay = lastPlayed !== today;

    return {
      todayScore: isNewDay ? 0 : parseInt(todayScore || '0', 10),
      streak: parseInt(streak || '0', 10),
      bestScore: parseInt(bestScore || '0', 10),
      lastPlayed,
      onboardingComplete: onboardingComplete === 'true',
      isPro: isPro === 'true',
      duelsToday: isNewDay ? 0 : parseInt(duelsToday || '0', 10),
    };
  } catch (error) {
    console.error('Error loading game state:', error);
    return DEFAULT_STATE;
  }
}

export interface SubmitScoreResult {
  newStreak: number;
  newBestScore: number;
  duelsToday: number;
  wasAlreadySubmitted: boolean;
}

export async function submitDuelScore(
  score: number,
  duelId: string
): Promise<SubmitScoreResult> {
  try {
    const lastDuelId = await AsyncStorage.getItem(STORAGE_KEYS.LAST_DUEL_ID);
    if (lastDuelId === duelId) {
      const state = await getGameState();
      return {
        newStreak: state.streak,
        newBestScore: state.bestScore,
        duelsToday: state.duelsToday,
        wasAlreadySubmitted: true,
      };
    }

    const today = getTodayString();
    const yesterday = getYesterdayString();

    const [
      storedStreak,
      storedBestScore,
      storedLastPlayed,
      storedDuelsToday,
      storedTodayScore,
    ] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.STREAK),
      AsyncStorage.getItem(STORAGE_KEYS.BEST_SCORE),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAYED),
      AsyncStorage.getItem(STORAGE_KEYS.DUELS_TODAY),
      AsyncStorage.getItem(STORAGE_KEYS.SCORE),
    ]);

    const currentStreak = parseInt(storedStreak || '0', 10);
    const currentBestScore = parseInt(storedBestScore || '0', 10);
    const isNewDay = storedLastPlayed !== today;
    const currentDuelsToday = isNewDay ? 0 : parseInt(storedDuelsToday || '0', 10);
    const currentTodayScore = isNewDay ? 0 : parseInt(storedTodayScore || '0', 10);

    let newStreak: number;
    
    if (storedLastPlayed === null) {
      newStreak = 1;
    } else if (storedLastPlayed === today) {
      newStreak = currentStreak;
    } else if (storedLastPlayed === yesterday) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const newTodayScore = Math.max(currentTodayScore, score);
    const newBestScore = Math.max(currentBestScore, score);
    const newDuelsToday = currentDuelsToday + 1;

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.SCORE, newTodayScore.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_PLAYED, today),
      AsyncStorage.setItem(STORAGE_KEYS.BEST_SCORE, newBestScore.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.DUELS_TODAY, newDuelsToday.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_DUEL_ID, duelId),
    ]);

    return { newStreak, newBestScore, duelsToday: newDuelsToday, wasAlreadySubmitted: false };
  } catch (error) {
    console.error('Error submitting duel score:', error);
    return { newStreak: 1, newBestScore: score, duelsToday: 1, wasAlreadySubmitted: false };
  }
}

export async function canPlayFreeDuel(): Promise<boolean> {
  if (__DEV__) {
    const devUnlimited = await AsyncStorage.getItem(STORAGE_KEYS.DEV_UNLIMITED);
    if (devUnlimited === 'true') return true;
  }
  const state = await getGameState();
  return state.isPro || state.duelsToday < 1;
}

export async function getDevUnlimitedMode(): Promise<boolean> {
  if (!__DEV__) return false;
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.DEV_UNLIMITED);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setDevUnlimitedMode(enabled: boolean): Promise<void> {
  if (!__DEV__) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DEV_UNLIMITED, enabled.toString());
  } catch (error) {
    console.error('Error setting dev unlimited mode:', error);
  }
}

export async function resetStreakAndScore(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.SCORE),
      AsyncStorage.removeItem(STORAGE_KEYS.BEST_SCORE),
      AsyncStorage.removeItem(STORAGE_KEYS.STREAK),
      AsyncStorage.removeItem(STORAGE_KEYS.DUELS_TODAY),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_DUEL_ID),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_PLAYED),
    ]);
  } catch (error) {
    console.error('Error resetting streak and score:', error);
  }
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
  } catch (error) {
    console.error('Error resetting game state:', error);
  }
}

export function generateDuelId(): string {
  return `duel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
