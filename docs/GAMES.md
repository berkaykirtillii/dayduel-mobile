# DayDuel Games - MVP Scoring & Mechanics

## Overview

DayDuel consists of 3 rounds (~90s each): Echo → Snap → Lock.
Final score = Echo score + Snap score + Lock score.

---

## 1. ECHO (Memory)

**Objective:** Memorize and reproduce flashing sequences on a grid.

### Score Formula

| Event | Points |
|-------|--------|
| Each correct tap (before completion) | +`pointsPerCorrect` |
| Complete sequence (final tap) | +`pointsPerCorrect × sequenceLength` |
| Wrong tap | -`penaltyPerMiss` (0 in MVP), sequence restarts |

**Perfect sequence total:** `(2N - 1) × pointsPerCorrect`  
where N = sequence length.

**Example (difficulty 2, sequence length 4):**
- Taps 1-3 correct: 3 × 120 = 360
- Tap 4 completes: 4 × 120 = 480 bonus
- Total: 840 points

### Progression
- Sequence length increases: `min(baseLength + floor(round/3), 8)`
- Grid: 3×3 (difficulty 1-3) → 4×4 (difficulty 4-5)
- Flash duration decreases at higher difficulties

### Adaptive Difficulty Parameters

| Difficulty | Grid Size | Sequence Length | Flash Duration (ms) | Gap Duration (ms) | Points/Correct |
|------------|-----------|-----------------|---------------------|-------------------|----------------|
| 1 | 3×3 | 3 | 600 | 300 | 100 |
| 2 | 3×3 | 4 | 500 | 250 | 120 |
| 3 | 3×3 | 5 | 450 | 200 | 150 |
| 4 | 4×4 | 5 | 400 | 200 | 180 |
| 5 | 4×4 | 6 | 350 | 150 | 200 |

**Soft Ceilings:**
- Sequence length: max 8
- Flash duration: min 300ms
- Gap duration: min 100ms

---

## 2. SNAP (Reflex)

**Objective:** Tap orange targets, avoid gray distractors.

### Score Formula

| Event | Points |
|-------|--------|
| Hit valid target | +`pointsPerTarget` + speed bonus |
| Hit distractor | -`penaltyPerDistractor`, +1 miss |
| Target expires (not tapped) | +1 miss (affects accuracy) |

**Speed bonus:** `max(0, (targetLifetime - reactionTime) / 100) × 5`

**Accuracy:** `hits / (hits + misses) × 100%`

### Key Mechanic
Expired targets count as misses for accuracy calculation.

### Adaptive Difficulty Parameters

| Difficulty | Spawn Rate (ms) | Target Lifetime (ms) | Distractor Ratio | Points/Target | Penalty | Max On Screen |
|------------|-----------------|----------------------|------------------|---------------|---------|---------------|
| 1 | 1200 | 1500 | 0.20 | 50 | 25 | 3 |
| 2 | 1000 | 1300 | 0.25 | 60 | 30 | 4 |
| 3 | 850 | 1100 | 0.30 | 75 | 35 | 5 |
| 4 | 700 | 950 | 0.35 | 90 | 40 | 6 |
| 5 | 600 | 800 | 0.40 | 100 | 50 | 7 |

**Soft Ceilings:**
- Target lifetime: min 600ms
- Spawn rate: min 500ms
- Distractor ratio: max 0.45

---

## 3. LOCK (Focus)

**Objective:** Tap falling shapes that match the round rule.

### Score Formula

| Event | Points |
|-------|--------|
| Correct tap (matches rule) | +`pointsPerCorrect` + speed bonus |
| Wrong tap (doesn't match) | -`penaltyPerWrong`, +1 wrong |
| Target missed (fell off screen) | -`penaltyPerMiss`, +1 missed |

**Speed bonus:** `max(0, (fallDuration - reactionTime) / 200) × 10`

### Visual Cues
- **Targets:** Filled shapes, full opacity, solid border
- **Distractors:** Outline only (transparent fill), 50% opacity, dashed border, actual color visible

### Rules (random each game)
- Color-based: "Only MAGENTA shapes", "Only ORANGE shapes"
- Shape-based: "Only CIRCLES", "Only SQUARES"
- Combined: "Only MAGENTA CIRCLES", "Only ORANGE SQUARES"

### Adaptive Difficulty Parameters

| Difficulty | Spawn Interval (ms) | Fall Duration (ms) | Target Ratio | Points/Correct | Miss Penalty | Wrong Penalty |
|------------|---------------------|--------------------|--------------| ---------------|--------------|---------------|
| 1 | 1000 | 3800 | 0.55 | 75 | 25 | 50 |
| 2 | 850 | 3400 | 0.50 | 90 | 30 | 60 |
| 3 | 750 | 3000 | 0.45 | 100 | 35 | 70 |
| 4 | 650 | 2700 | 0.42 | 120 | 40 | 80 |
| 5 | 550 | 2400 | 0.40 | 150 | 50 | 100 |

**Soft Ceilings:**
- Spawn interval: min 500ms
- Fall duration: min 2000ms
- Target ratio: min 0.35, max 0.60

**Lock Spawn Tweak Notes (v1.1):**
- Reduced spawn intervals from 1400-700ms → 1000-550ms for more tap opportunities
- Added `targetRatio` config to ensure consistent target frequency
- Previous design relied on random chance (~40%); now uses explicit targeting

---

## Difficulty Scaling

### Day-to-Day Adaptive Baseline
All games adapt difficulty (1-5) based on player performance across sessions.
- Average accuracy ≥85%: difficulty +1 (max 5)
- Average accuracy <50%: difficulty -1 (min 1)
- Stored in AsyncStorage; persists across app restarts

### In-Session Progressive Difficulty
Within each ~90s round, difficulty adapts based on real-time performance:

| Parameter | Value |
|-----------|-------|
| Warm-up period | 10 seconds |
| Correct streak to increase | 3 consecutive |
| Miss streak to decrease | 2 consecutive |
| Level range | Base difficulty ± 2 (clamped 1-5) |

**Pattern:** After warm-up, step difficulty +1 on performance streaks, -1 on miss streaks, clamped to soft min/max.

See `src/utils/sessionDifficulty.ts` for implementation.

---

## Haptic & Sound Feedback

### Event → Haptic → SFX Mapping

| Event | Haptic Type | Description |
|-------|-------------|-------------|
| Success (correct tap) | Light impact | Quick confirmation vibration |
| Miss (wrong tap) | Warning notification | Distinct error feedback |
| Streak milestone (every 5) | Medium impact | Celebrates achievement |
| Urgency (t=10s) | Light impact | One pulse at 10s mark |
| Round complete | Success notification | End-of-round celebration |

### Implementation
- Uses `expo-haptics` for cross-platform haptic feedback
- Respects OS haptic settings automatically
- Mute-safe: no crashes if haptics unavailable
- See `src/utils/feedback.ts` for central feedback handler

---

## Last 10 Seconds Urgency

### Visual Feedback
When remaining time ≤ 10 seconds:
- **Edge vignette:** Orange/magenta gradient on screen edges
- **Pulse animation:** ~1Hz opacity pulse (0.3 → 0.6)
- **Timer styling:** Red background on timer badge
- **Progress bar:** Continues normal display

### Haptic Feedback
- One haptic pulse at exactly t=10 seconds
- No repeated vibrations (avoids spam)

### Implementation
- Centralized in `RoundShell` component
- Uses `LinearGradient` for vignette effect
- Animated pulse via React Native Animated API

---

## File Reference

| File | Purpose |
|------|---------|
| `src/constants/gameConfig.ts` | All difficulty configurations |
| `src/utils/difficulty.ts` | Day-to-day adaptive baseline |
| `src/utils/sessionDifficulty.ts` | In-session progressive difficulty |
| `src/utils/feedback.ts` | Haptics & SFX utility |
| `src/components/RoundShell.tsx` | Timer, urgency UI, score tracking |
| `app/game/echo.tsx` | Echo round implementation |
| `app/game/snap.tsx` | Snap round implementation |
| `app/game/lock.tsx` | Lock round implementation |
