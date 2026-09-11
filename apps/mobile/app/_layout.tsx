import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VaultProvider, useVault } from '../context/VaultContext';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { COLORS } from '../constants/theme';

function RootLayoutNav() {
  const { isUnlocked, vaultExists, isLoading } = useVault();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const segList = segments as string[];
    const inAuthGroup = segList[0] === '(auth)';

    if (!vaultExists) {
      if (segList[1] !== 'setup' && segList[1] !== 'import') {
        router.replace('/(auth)/setup');
      }
    } else if (!isUnlocked) {
      if (segList[1] !== 'unlock') {
        router.replace('/(auth)/unlock');
      }
    } else if (inAuthGroup) {
      router.replace('/(tabs)/passwords');
    }
  }, [isUnlocked, vaultExists, isLoading, segments]);

  if (isLoading) {
    return <LoadingOverlay message="Checking vault security..." />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(auth)/setup" />
        <Stack.Screen name="(auth)/unlock" />
        <Stack.Screen name="(auth)/import" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <RootLayoutNav />
      </VaultProvider>
    </SafeAreaProvider>
  );
}
