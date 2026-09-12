import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
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
        <TouchableOpacity onPress={handleBack} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PROFILE</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={[styles.statusBadge, isPro && styles.statusBadgePro]}>
            <Text style={[styles.statusText, isPro && styles.statusTextPro]}>
              {isPro ? '⚡ PRO MEMBER' : '🆓 FREE TIER'}
            </Text>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>YOUR STATS</Text>
            <View style={styles.statsGrid}>
              <StatCard label="Today" value={todayScore.toLocaleString()} />
              <View style={styles.statGap} />
              <StatCard label="Best" value={bestScore.toLocaleString()} />
            </View>

            <View style={styles.statsGrid}>
              <StatCard label="Streak" value={`${streak}🔥`} variant={streak > 0 ? 'highlight' : 'default'} />
              <View style={styles.statGap} />
              <StatCard label="Duels Today" value={duelsToday} />
            </View>
          </View>

          {!isPro && (
            <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
              <View style={styles.upgradeContent}>
                <Text style={styles.upgradeIcon}>⚡</Text>
                <View style={styles.upgradeTextContainer}>
                  <Text style={styles.upgradeTitle}>GO PRO</Text>
                  <Text style={styles.upgradeDescription}>
                    Unlimited duels • Streak shield • $4.99/mo
                  </Text>
                </View>
              </View>
              <Text style={styles.upgradeArrow}>→</Text>
            </TouchableOpacity>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>🎵</Text>
              <Text style={styles.menuText}>Sound & Haptics</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>❓</Text>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📜</Text>
              <Text style={styles.menuText}>Terms & Privacy</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && (
            <View style={styles.devSection}>
              <View style={styles.devHeader}>
                <Text style={styles.devSectionTitle}>🛠 DEV / QA TOOLS</Text>
              </View>
              
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
                <Text style={styles.devHint}>
                  Controls game speed & complexity
                </Text>
              </View>

              <View style={styles.devCard}>
                <View style={styles.devToggleRow}>
                  <View style={styles.devToggleInfo}>
                    <Text style={styles.devLabel}>Unlimited Duels</Text>
                    <Text style={styles.devHint}>Bypass 1 free duel/day limit</Text>
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
                <Text style={styles.devResetText}>🔄 Reset Streak, Score & Day State</Text>
              </TouchableOpacity>
              <Text style={styles.devResetHint}>
                Clears lastPlayed — freemium day resets cleanly
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleResetData} style={styles.dangerButton}>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
  },
  backButton: {
    fontSize: typography.sizes.xl,
    color: colors.orange,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 3,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  statusBadge: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statusBadgePro: {
    borderColor: colors.orange,
    backgroundColor: 'rgba(255, 90, 31, 0.1)',
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 1,
  },
  statusTextPro: {
    color: colors.orange,
  },
  statsSection: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statGap: {
    width: spacing.sm,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.orange,
    marginBottom: spacing.lg,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upgradeIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.orange,
    marginBottom: 2,
  },
  upgradeDescription: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  upgradeArrow: {
    fontSize: typography.sizes.xl,
    color: colors.orange,
    marginLeft: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  menuArrow: {
    fontSize: typography.sizes.lg,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  dangerButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dangerText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: '600',
  },
  version: {
    fontSize: typography.sizes.xs,
    color: colors.mutedDark,
  },
  devSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  devHeader: {
    borderBottomWidth: 2,
    borderBottomColor: colors.orange,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  devSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.orange,
    letterSpacing: 2,
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
    backgroundColor: colors.bg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  difficultyButtonActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  difficultyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
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
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
  },
  devResetText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.error,
  },
  devResetHint: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
