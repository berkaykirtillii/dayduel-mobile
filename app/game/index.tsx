import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import { generateDuelId } from '../../src/utils/storage';

const ROUNDS = [
  { id: 'echo', name: 'ECHO', description: 'Memory Round', icon: '🧠' },
  { id: 'snap', name: 'SNAP', description: 'Reflex Round', icon: '⚡' },
  { id: 'lock', name: 'LOCK', description: 'Focus Round', icon: '🎯' },
];

export default function GameStartScreen() {
  const [countdown, setCountdown] = useState(3);
  const [duelId] = useState(() => generateDuelId());

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.replace({
        pathname: '/game/echo',
        params: { duelId, totalScore: '0' },
      });
    }
  }, [countdown, duelId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>GET READY</Text>
        
        <View style={styles.countdown}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>

        <View style={styles.rounds}>
          {ROUNDS.map((round, index) => (
            <View key={round.id} style={styles.roundItem}>
              <Text style={styles.roundNumber}>{index + 1}</Text>
              <View style={styles.roundInfo}>
                <Text style={styles.roundIcon}>{round.icon}</Text>
                <View>
                  <Text style={styles.roundName}>{round.name}</Text>
                  <Text style={styles.roundDescription}>{round.description}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 4,
    marginBottom: spacing.xl,
  },
  countdown: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  countdownText: {
    fontSize: typography.sizes.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rounds: {
    width: '100%',
    gap: spacing.sm,
  },
  roundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roundNumber: {
    fontSize: typography.sizes.md,
    fontWeight: typography.display.fontWeight,
    color: colors.mutedDark,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  roundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roundIcon: {
    fontSize: 26,
  },
  roundName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 2,
  },
  roundDescription: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    letterSpacing: 0.5,
  },
});
