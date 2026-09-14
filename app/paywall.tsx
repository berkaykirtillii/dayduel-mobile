import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

const FREE_FEATURES = [
  '1 duel / day',
  'Basic Echo·Snap·Lock',
  'No rematch',
];

const PRO_FEATURES = [
  'Unlimited rematch',
  'Streak shield',
  'Harder Lock rounds',
];

const PRO_BENEFITS = [
  {
    icon: '♾️',
    title: 'Unlimited rematch',
    description: "Replay today's duel anytime — no wait.",
  },
  {
    icon: '🛡️',
    title: 'Streak shield',
    description: 'Miss a day? Your streak stays lit once.',
  },
];

export default function PaywallScreen() {
  const { upgradeToPro } = useGameState();

  const handlePurchase = async () => {
    await upgradeToPro();
    router.back();
  };

  const handleRestore = () => {
    console.log('Restore purchases');
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>KEEP THE</Text>
            <Text style={styles.heroTitleAccent}>STREAK HOT</Text>
          </View>

          <View style={styles.compareCards}>
            <View style={styles.freeCard}>
              <Text style={styles.cardTitle}>FREE</Text>
              <View style={styles.featureList}>
                {FREE_FEATURES.map((feature, index) => (
                  <Text key={index} style={styles.featureText}>· {feature}</Text>
                ))}
              </View>
            </View>

            <View style={styles.proCard}>
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.proCardTitle}>PRO</Text>
              <View style={styles.featureList}>
                {PRO_FEATURES.map((feature, index) => (
                  <Text key={index} style={styles.proFeatureText}>· {feature}</Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.benefits}>
            {PRO_BENEFITS.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>$4.99</Text>
            <Text style={styles.pricePeriod}>/mo</Text>
          </View>
          <Text style={styles.cancelText}>Cancel anytime · Pro unlocks all heat</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="GO PRO"
          onPress={handlePurchase}
          size="lg"
          style={styles.button}
        />
        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore purchases</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: colors.muted,
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
  },
  heroSection: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  heroTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 2,
  },
  heroTitleAccent: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.magenta,
    letterSpacing: 2,
  },
  compareCards: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  freeCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  featureList: {
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    color: colors.muted,
  },
  proCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.magenta,
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: colors.magenta,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  bestValueText: {
    fontSize: 9,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
  },
  proCardTitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.magenta,
    letterSpacing: 2,
    marginBottom: spacing.md,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  proFeatureText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    color: colors.text,
  },
  benefits: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.bodySemiBold,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.muted,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.fonts.display,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
  },
  pricePeriod: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.body,
    color: colors.muted,
    marginLeft: spacing.xs,
  },
  cancelText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
  restoreText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.muted,
  },
});
