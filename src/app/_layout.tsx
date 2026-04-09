import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="game/[levelId]" />
      <Stack.Screen name="game/daily" />
      <Stack.Screen name="result/index" />
      <Stack.Screen name="zen/index" />
    </Stack>
  );
}
