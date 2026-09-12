import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/constants/theme';

const ROUNDS = [
  { id: 'echo', name: 'ECHO', description: 'Memory Round', icon: '🧠' },
  { id: 'snap', name: 'SNAP', description: 'Reflex Round', icon: '⚡' },
  { id: 'lock', name: 'LOCK', description: 'Focus Round', icon: '🎯' },
];

export default function GameStartScreen() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.replace('/game/echo');
    }
  }, [countdown]);

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
    fontSize: typography.sizes.xl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 4,
    marginBottom: spacing.xxl,
  },
  countdown: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  countdownText: {
    fontSize: typography.sizes.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  rounds: {
    width: '100%',
    gap: spacing.md,
  },
  roundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roundNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.muted,
    marginRight: spacing.md,
    width: 24,
  },
  roundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roundIcon: {
    fontSize: 24,
  },
  roundName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 1,
  },
  roundDescription: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
});
