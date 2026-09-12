# DayDuel Mobile

5-minute daily mind sprint app. Reclaim your focus with three quick rounds: Echo (Memory), Snap (Reflex), and Lock (Focus).

## Features

- **Daily Duel**: One-tap start for a 5-minute cognitive workout
- **3 Game Rounds**: 
  - 🧠 **Echo** - Memory challenge (~90s)
  - ⚡ **Snap** - Reflex test (~90s)  
  - 🎯 **Lock** - Focus exercise (~90s)
- **Streak Tracking**: Build your daily streak
- **Score History**: Track today's score and personal best
- **Guest-First**: No account required to play
- **Freemium Model**: 1 free duel/day, Pro for unlimited ($4.99/mo)

## Tech Stack

- [Expo](https://expo.dev/) (React Native)
- [Expo Router](https://expo.github.io/router/) for navigation
- TypeScript
- AsyncStorage for local persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (installed automatically via npx)
- iOS Simulator (macOS) or Android Emulator, or Expo Go app on your device

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd dayduel

# Install dependencies
npm install
```

### Running the App

```bash
# Start the development server
npx expo start

# Or with specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

Scan the QR code with the Expo Go app (Android) or Camera app (iOS) to run on your device.

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Entry point (redirects based on state)
│   ├── onboarding.tsx      # Onboarding flow
│   ├── home.tsx            # Home screen with DAY DUEL orb
│   ├── game/               # Game flow screens
│   │   ├── _layout.tsx     # Game layout
│   │   ├── index.tsx       # Countdown screen
│   │   ├── echo.tsx        # Round 1: Memory
│   │   ├── snap.tsx        # Round 2: Reflex
│   │   └── lock.tsx        # Round 3: Focus
│   ├── result.tsx          # Day result screen
│   ├── paywall.tsx         # Pro upgrade modal
│   └── profile.tsx         # Profile & settings
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── OrbButton.tsx   # Main CTA orb
│   │   ├── StatCard.tsx    # Score/streak cards
│   │   ├── Button.tsx      # Generic button
│   │   └── StreakBadge.tsx # Streak indicator
│   ├── constants/
│   │   └── theme.ts        # Arcade Heat theme tokens
│   ├── hooks/
│   │   └── useGameState.ts # Game state management
│   └── utils/
│       └── storage.ts      # AsyncStorage persistence
├── assets/                 # App icons and images
├── app.json               # Expo configuration
└── package.json
```

## Theme: Arcade Heat

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0B0B0F` | Main background |
| `card` | `#16161D` | Card backgrounds |
| `orange` | `#FF5A1F` | Primary accent, CTAs |
| `magenta` | `#FF2D95` | Secondary accent |
| `text` | `#F5F5F7` | Primary text |
| `muted` | `#A1A1AA` | Secondary text |

## Screens

1. **Onboarding** - Welcome slides for new users
2. **Home** - Large orange orb CTA, today's score, streak counter
3. **Game Flow** - Countdown → Echo → Snap → Lock rounds
4. **Result** - Final score, streak update, round breakdown
5. **Paywall** - Pro subscription offer (soft paywall)
6. **Profile** - Stats, settings, subscription status

## Development Status

This is the **scaffold/MVP** version. Game mechanics are stubs (tap-to-score placeholders).

### TODO for Full Implementation

- [ ] Echo round: Sequence memory game
- [ ] Snap round: Reflex reaction game
- [ ] Lock round: Focus/concentration game
- [ ] In-app purchases integration
- [ ] Push notifications for daily reminders
- [ ] Analytics integration
- [ ] Sound effects and haptics
- [ ] Animated transitions

## License

MIT
