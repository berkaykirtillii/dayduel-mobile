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
- **Distractors:** Outline only, 50% opacity, dashed border, actual color visible

### Rules (random each game)
- Color-based: "Only MAGENTA shapes", "Only ORANGE shapes"
- Shape-based: "Only CIRCLES", "Only SQUARES"
- Combined: "Only MAGENTA CIRCLES", "Only ORANGE SQUARES"

---

## Difficulty Scaling

All games adapt difficulty (1-5) based on player performance.
Higher difficulty → faster pace, more distractors, higher point values.

See `src/constants/gameConfig.ts` for exact values.
