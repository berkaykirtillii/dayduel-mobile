import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  getGameState,
  submitDuelScore,
  canPlayFreeDuel,
  setOnboardingComplete as setOnboardingCompleteStorage,
  setProStatus as setProStatusStorage,
  generateDuelId,
} from '../utils/storage';

export function useGameState() {
  const [state, setState] = useState<GameState>({
    todayScore: 0,
    streak: 0,
    bestScore: 0,
    lastPlayed: null,
    onboardingComplete: false,
    isPro: false,
    duelsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadState = useCallback(async () => {
    const gameState = await getGameState();
    setState(gameState);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const submitScore = useCallback(async (score: number, duelId: string) => {
    const result = await submitDuelScore(score, duelId);

    if (!result.wasAlreadySubmitted) {
      setState(prev => ({
        ...prev,
        todayScore: score,
        streak: result.newStreak,
        bestScore: result.newBestScore,
        lastPlayed: new Date().toDateString(),
        duelsToday: result.duelsToday,
      }));
    }

    return result;
  }, []);

  const checkCanPlay = useCallback(async () => {
    return canPlayFreeDuel();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await setOnboardingCompleteStorage();
    setState(prev => ({ ...prev, onboardingComplete: true }));
  }, []);

  const upgradeToPro = useCallback(async () => {
    await setProStatusStorage(true);
    setState(prev => ({ ...prev, isPro: true }));
  }, []);

  return {
    ...state,
    loading,
    submitScore,
    checkCanPlay,
    completeOnboarding,
    upgradeToPro,
    refresh: loadState,
    generateDuelId,
  };
}
