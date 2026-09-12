import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useGameState } from '../src/hooks/useGameState';
import { colors } from '../src/constants/theme';

export default function IndexScreen() {
  const { loading, onboardingComplete } = useGameState();

  useEffect(() => {
    if (!loading) {
      if (onboardingComplete) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [loading, onboardingComplete]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.orange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
