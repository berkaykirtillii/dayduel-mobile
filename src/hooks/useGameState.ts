import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  getGameState,
  updateStreakAndSaveScore,
  canPlayFreeDuel,
  setOnboardingComplete as setOnboardingCompleteStorage,
  setProStatus as setProStatusStorage,
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
  const submittingRef = useRef(false);

  const loadState = useCallback(async () => {
    const gameState = await getGameState();
    setState(gameState);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const submitScore = useCallback(async (score: number) => {
    if (submittingRef.current) {
      return { score: state.todayScore, streak: state.streak, alreadySubmitted: true };
    }
    submittingRef.current = true;
    
    try {
      const result = await updateStreakAndSaveScore(score);
      
      setState(prev => ({
        ...prev,
        todayScore: score,
        streak: result.newStreak,
        bestScore: result.newBestScore,
        lastPlayed: new Date().toDateString(),
        duelsToday: result.duelsToday,
      }));
      
      return { score, streak: result.newStreak, alreadySubmitted: false };
    } finally {
      submittingRef.current = false;
    }
  }, [state.todayScore, state.streak]);

  const checkCanPlay = useCallback(async () => {
    const freshState = await getGameState();
    return freshState.isPro || freshState.duelsToday < 1;
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
  };
}
