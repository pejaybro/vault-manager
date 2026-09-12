import 'react-native-get-random-values';
// NOTE: @peculiar/webcrypto intentionally NOT imported here.
// React Native 0.73+ / Expo SDK 50+ with Hermes already ships native
// crypto.subtle (SubtleCrypto). react-native-get-random-values patches
// crypto.getRandomValues for older Android devices only.

import React, { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { VaultProvider, useVault } from '../context/VaultContext';
import { DrawerProvider } from '../context/DrawerContext';
import { SideDrawer } from '../components/SideDrawer';
import { COLORS } from '../constants/theme';

// Keep native splash visible until we know which screen to show.
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { isUnlocked, vaultExists, isLoading } = useVault();
  const router = useRouter();
  const navigated = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (navigated.current) return;
    navigated.current = true;

    if (!vaultExists) {
      router.replace('/(auth)/setup');
    } else if (!isUnlocked) {
      router.replace('/(auth)/unlock');
    } else {
      router.replace('/(tabs)/passwords');
    }

    // Hide splash only after correct screen is ready
    SplashScreen.hideAsync().catch(() => {});
  }, [isLoading, isUnlocked, vaultExists]);

  // Return null while loading — splash screen covers the gap, nothing flashes
  if (isLoading) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'none',
        }}
      >
        <Stack.Screen name="(auth)/setup" />
        <Stack.Screen name="(auth)/unlock" />
        <Stack.Screen name="(auth)/import" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <SideDrawer />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <DrawerProvider>
          <RootLayoutNav />
        </DrawerProvider>
      </VaultProvider>
    </SafeAreaProvider>
  );
}
