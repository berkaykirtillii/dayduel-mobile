import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';
import { lightImpact } from '../src/utils/haptics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '⚡',
    title: '5 MIN.\nRECLAIM YOUR\nFOCUS.',
    subtitle: 'Daily memory → reflex → focus duel.\nArcade heat. Zero fluff.',
  },
  {
    icon: '🎯',
    title: '3 ROUNDS.\n1 SCORE.\nDAILY STREAK.',
    subtitle: 'Echo • Snap • Lock\nComplete all three. Beat your best.',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useGameState();

  const handleContinue = async () => {
    lightImpact();
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await completeOnboarding();
      router.replace('/home');
    }
  };

  const handleGuestEntry = async () => {
    lightImpact();
    await completeOnboarding();
    router.replace('/home');
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[colors.orangeLight, colors.orange]}
            style={styles.iconGradient}
          >
            <Text style={styles.icon}>{slide.icon}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          title="CONTINUE"
          onPress={handleContinue}
          size="lg"
          style={styles.button}
        />

        <TouchableOpacity onPress={handleGuestEntry} style={styles.guestLink}>
          <Text style={styles.guestText}>Already playing? Enter as guest</Text>
        </TouchableOpacity>
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
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: typography.display.letterSpacing,
    lineHeight: typography.sizes.xxl * 1.3,
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: typography.sizes.md * 1.5,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.card,
  },
  dotActive: {
    backgroundColor: colors.orange,
    width: 32,
  },
  button: {
    width: '100%',
  },
  guestLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  guestText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
});
