/**
 * Feedback Utility - Haptics & SFX for game events
 * 
 * Event → Haptic → SFX mapping:
 * - success:        light impact      → tick.mp3
 * - miss:           warning notif     → miss.mp3
 * - streakMilestone: medium/rigid     → streak.mp3
 * - urgency:        light impact      → (optional beep)
 * - roundComplete:  success notif     → complete.mp3
 */

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

type FeedbackEvent = 'success' | 'miss' | 'streakMilestone' | 'urgency' | 'roundComplete';

interface SoundCache {
  success?: Audio.Sound;
  miss?: Audio.Sound;
  streak?: Audio.Sound;
  complete?: Audio.Sound;
}

const soundCache: SoundCache = {};
let soundsEnabled = true;
let hapticsEnabled = true;

export async function initializeFeedback(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.warn('Audio initialization failed:', error);
    soundsEnabled = false;
  }
}

export function setSoundsEnabled(enabled: boolean): void {
  soundsEnabled = enabled;
}

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

async function playHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Haptics may not be available on all devices
  }
}

export async function triggerFeedback(event: FeedbackEvent): Promise<void> {
  switch (event) {
    case 'success':
      await playHaptic('light');
      break;
    case 'miss':
      await playHaptic('warning');
      break;
    case 'streakMilestone':
      await playHaptic('medium');
      break;
    case 'urgency':
      await playHaptic('light');
      break;
    case 'roundComplete':
      await playHaptic('success');
      break;
  }
}

export async function triggerSuccessFeedback(): Promise<void> {
  await triggerFeedback('success');
}

export async function triggerMissFeedback(): Promise<void> {
  await triggerFeedback('miss');
}

export async function triggerStreakFeedback(): Promise<void> {
  await triggerFeedback('streakMilestone');
}

export async function triggerUrgencyFeedback(): Promise<void> {
  await triggerFeedback('urgency');
}

export async function cleanupFeedback(): Promise<void> {
  for (const sound of Object.values(soundCache)) {
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
}

export const STREAK_MILESTONE = 5;

export function isStreakMilestone(streak: number): boolean {
  return streak > 0 && streak % STREAK_MILESTONE === 0;
}
