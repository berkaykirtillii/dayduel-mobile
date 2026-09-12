import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../src/components';
import { useGameState } from '../src/hooks/useGameState';
import { colors, typography, spacing, borderRadius } from '../src/constants/theme';

const FEATURES = [
  { icon: '♾️', text: 'Unlimited daily duels' },
  { icon: '📊', text: 'Detailed performance analytics' },
  { icon: '🎯', text: 'Advanced focus exercises' },
  { icon: '🏆', text: 'Exclusive challenges' },
  { icon: '🚫', text: 'No ads, ever' },
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
        <Button title="✕" onPress={handleClose} variant="ghost" />
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={[colors.orangeLight, colors.orange]}
          style={styles.iconContainer}
        >
          <Text style={styles.icon}>⚡</Text>
        </LinearGradient>

        <Text style={styles.title}>UPGRADE TO PRO</Text>
        <Text style={styles.subtitle}>Unlock your full potential</Text>

        <View style={styles.features}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.pricePeriod}>/month</Text>
        </View>

        <Text style={styles.trial}>Start with 7-day free trial</Text>
      </View>

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
          Cancel anytime. Terms and conditions apply.
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
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.display.fontWeight,
    color: colors.text,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.muted,
    marginBottom: spacing.xl,
  },
  features: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
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
  trial: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
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
