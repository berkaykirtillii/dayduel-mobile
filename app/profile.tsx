import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, StatCard } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { resetGameState } from '../src/utils/storage';
import { getDifficulty, setDifficulty, DifficultyLevel } from '../src/utils/difficulty';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

export default function ProfileScreen() {
  const { 
    todayScore, 
    streak, 
    bestScore, 
    isPro, 
    duelsToday, 
    refresh,
    devUnlimited,
    toggleDevUnlimited,
    resetStreakAndScore,
  } = useGameState();
  
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(2);

  useEffect(() => {
    getDifficulty().then(setCurrentDifficulty);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleUpgrade = () => {
    router.push('/paywall');
  };

  const handleDifficultyChange = async (level: DifficultyLevel) => {
    await setDifficulty(level);
    setCurrentDifficulty(level);
  };

  const handleResetQA = () => {
    Alert.alert(
      'Reset Streak & Score',
      'This will reset your streak and all scores to 0 for QA testing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetStreakAndScore();
            Alert.alert('Reset Complete', 'Streak and scores have been reset.');
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your scores, streaks, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetGameState();
            await refresh();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PROFILE</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{isPro ? '⚡ PRO' : '🆓 FREE'}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Today's Score" value={todayScore.toLocaleString()} />
          <View style={styles.statGap} />
          <StatCard label="Best Score" value={bestScore.toLocaleString()} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Current Streak" value={`${streak} days`} variant="highlight" />
          <View style={styles.statGap} />
          <StatCard label="Duels Today" value={duelsToday} />
        </View>

        {!isPro && (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>Unlock Pro</Text>
            <Text style={styles.upgradeDescription}>
              Get unlimited duels, detailed analytics, and more.
            </Text>
            <Button
              title="UPGRADE - $4.99/mo"
              onPress={handleUpgrade}
              size="sm"
              style={styles.upgradeButton}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🎵</Text>
            <Text style={styles.menuText}>Sound & Haptics</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📜</Text>
            <Text style={styles.menuText}>Terms & Privacy</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <View style={styles.devSection}>
            <Text style={styles.devSectionTitle}>🛠 DEV / TEST</Text>
            
            <View style={styles.devCard}>
              <Text style={styles.devLabel}>Difficulty Level</Text>
              <View style={styles.difficultyPicker}>
                {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      currentDifficulty === level && styles.difficultyButtonActive,
                    ]}
                    onPress={() => handleDifficultyChange(level)}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        currentDifficulty === level && styles.difficultyButtonTextActive,
                      ]}
                    >
                      L{level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.devHint}>Current: Level {currentDifficulty}</Text>
            </View>

            <View style={styles.devCard}>
              <View style={styles.devToggleRow}>
                <View style={styles.devToggleInfo}>
                  <Text style={styles.devLabel}>Unlimited Duels (Test)</Text>
                  <Text style={styles.devHint}>Bypass freemium 1/day limit</Text>
                </View>
                <Switch
                  value={devUnlimited}
                  onValueChange={toggleDevUnlimited}
                  trackColor={{ false: colors.cardBorder, true: colors.orange }}
                  thumbColor={colors.text}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.devResetButton} onPress={handleResetQA}>
              <Text style={styles.devResetText}>Reset Streak & Score (QA)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleResetData}>
          <Text style={styles.dangerText}>Reset All Data</Text>
        </TouchableOpacity>
        <Text style={styles.version}>DayDuel v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    fontSize: typography.sizes.md,
    color: colors.orange,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 2,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  statusBadge: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  statusText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statGap: {
    width: spacing.md,
  },
  upgradeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.orange,
    marginVertical: spacing.lg,
  },
  upgradeTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  upgradeDescription: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  menuArrow: {
    fontSize: typography.sizes.md,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  dangerText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
  },
  version: {
    fontSize: typography.sizes.xs,
    color: colors.mutedDark,
  },
  devSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.orange,
  },
  devSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  devCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.orange,
    borderStyle: 'dashed',
  },
  devLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  devHint: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  difficultyPicker: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: colors.orange,
  },
  difficultyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.muted,
  },
  difficultyButtonTextActive: {
    color: colors.text,
  },
  devToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  devToggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  devResetButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: spacing.sm,
  },
  devResetText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.error,
  },
});
