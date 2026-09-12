import { Stack } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="echo" />
      <Stack.Screen name="snap" />
      <Stack.Screen name="lock" />
    </Stack>
  );
}
