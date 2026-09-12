import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '⚡',
    title: '5-MIN\nMIND SPRINT',
    subtitle: 'Daily brain training.\nArcade energy. Zero fluff.',
    accent: colors.orange,
  },
  {
    icon: '🧠',
    title: '3 ROUNDS\n1 SCORE',
    subtitle: 'Echo (memory) → Snap (reflex) → Lock (focus)\nComplete all three. Beat your best.',
    accent: colors.magenta,
  },
  {
    icon: '🔥',
    title: 'BUILD YOUR\nSTREAK',
    subtitle: 'Play once daily. Track progress.\nFree forever. Pro unlocks more.',
    accent: colors.orange,
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useGameState();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleContinue = async () => {
    if (currentSlide < SLIDES.length - 1) {
      animateTransition(() => setCurrentSlide(currentSlide + 1));
    } else {
      await completeOnboarding();
      router.replace('/home');
    }
  };

  const handleGuestEntry = async () => {
    await completeOnboarding();
    router.replace('/home');
  };

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>DAYDUEL</Text>
      </View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.iconContainer, { shadowColor: slide.accent }]}>
          <LinearGradient
            colors={[slide.accent, slide.accent === colors.orange ? colors.orangeDark : '#CC2477']}
            style={styles.iconGradient}
          >
            <Text style={styles.icon}>{slide.icon}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((s, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && [styles.dotActive, { backgroundColor: s.accent }],
              ]}
            />
          ))}
        </View>

        <Button
          title={isLastSlide ? "LET'S GO" : 'CONTINUE'}
          onPress={handleContinue}
          size="lg"
          style={styles.button}
        />

        {currentSlide === 0 && (
          <TouchableOpacity onPress={handleGuestEntry} style={styles.guestLink}>
            <Text style={styles.guestText}>Skip intro</Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  logo: {
    fontSize: typography.sizes.md,
    fontWeight: typography.display.fontWeight,
    color: colors.muted,
    letterSpacing: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: typography.sizes.xxxl * 1.2,
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.md * 1.6,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBorder,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.orange,
  },
  button: {
    width: '100%',
  },
  guestLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  guestText: {
    fontSize: typography.sizes.sm,
    color: colors.mutedDark,
  },
});
