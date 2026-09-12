import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

const FEATURES = [
  { 
    icon: '♾️', 
    title: 'Unlimited Rematch',
    description: 'Play as many duels as you want, every day',
    highlight: true,
  },
  { 
    icon: '🛡️', 
    title: 'Streak Shield',
    description: 'Miss a day? Your streak stays protected',
    highlight: true,
  },
  { 
    icon: '🧘', 
    title: 'Deeper Focus Mode',
    description: 'Extended 5-min sessions for serious training',
    highlight: false,
  },
  { 
    icon: '📈', 
    title: 'Performance Insights',
    description: 'Track your cognitive improvement over time',
    highlight: false,
  },
];

export default function PaywallScreen() {
  const { upgradeToPro } = useGameState();

  const handlePurchase = async () => {
    // TODO: Integrate with in-app purchases
    await upgradeToPro();
    router.back();
  };

  const handleRestore = () => {
    // TODO: Implement restore purchases
    console.log('Restore purchases');
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>GO PRO</Text>
        <Button title="✕" onPress={handleClose} variant="ghost" />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[colors.orange, colors.orangeDark]}
              style={styles.iconContainer}
            >
              <Text style={styles.icon}>⚡</Text>
            </LinearGradient>
            <Text style={styles.heroTitle}>UNLOCK YOUR</Text>
            <Text style={styles.heroTitleAccent}>FULL POTENTIAL</Text>
            <Text style={styles.heroSubtitle}>
              Train without limits. Build unstoppable streaks.
            </Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map((feature, index) => (
              <View 
                key={index} 
                style={[
                  styles.featureItem,
                  feature.highlight && styles.featureItemHighlight
                ]}
              >
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={[
                    styles.featureTitle,
                    feature.highlight && styles.featureTitleHighlight
                  ]}>
                    {feature.title}
                  </Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>PRO SUBSCRIPTION</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$4.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <View style={styles.trialBadge}>
              <Text style={styles.trialText}>7-DAY FREE TRIAL</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="START FREE TRIAL"
          onPress={handlePurchase}
          size="lg"
          style={styles.button}
        />
        <Button
          title="Restore Purchases"
          onPress={handleRestore}
          variant="ghost"
        />
        <Text style={styles.terms}>
          Cancel anytime • Billed after trial • Terms apply
        </Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerPlaceholder: {
    width: 44,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.display.fontWeight,
    color: colors.orange,
    letterSpacing: 3,
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
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 44,
  },
  heroTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.display.fontWeight,
    color: colors.muted,
    letterSpacing: 3,
  },
  heroTitleAccent: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  featureItemHighlight: {
    borderColor: colors.orange,
    backgroundColor: 'rgba(255, 90, 31, 0.05)',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  featureTitleHighlight: {
    color: colors.orange,
  },
  featureDescription: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  priceCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.orange,
  },
  priceLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.display.fontWeight,
    color: colors.orange,
  },
  pricePeriod: {
    fontSize: typography.sizes.lg,
    color: colors.muted,
    marginLeft: spacing.xs,
  },
  trialBadge: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  trialText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
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
  terms: {
    fontSize: typography.sizes.xs,
    color: colors.mutedDark,
    textAlign: 'center',
  },
});
