import 'react-native-get-random-values';
import { Crypto as PeculiarCrypto } from '@peculiar/webcrypto';

if (typeof globalThis !== 'undefined' && globalThis.crypto) {
  if (!(globalThis.crypto as any).subtle) {
    const peculiar = new PeculiarCrypto();
    (globalThis.crypto as any).subtle = peculiar.subtle;
  }
}

import React, { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { VaultProvider, useVault } from '../context/VaultContext';
import { DrawerProvider } from '../context/DrawerContext';
import { SideDrawer } from '../components/SideDrawer';
import { COLORS } from '../constants/theme';

// Keep the native splash screen visible until we decide where to navigate.
// This is the ONLY reliable way to prevent the setup/login flash.
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { isUnlocked, vaultExists, isLoading } = useVault();
  const router = useRouter();
  // Track whether we've already navigated to the correct first screen
  const navigated = useRef(false);

  useEffect(() => {
    // Wait until vault state is fully resolved
    if (isLoading) return;
    // Only do the initial navigation once
    if (navigated.current) return;
    navigated.current = true;

    // Navigate to the correct screen based on vault state
    if (!vaultExists) {
      router.replace('/(auth)/setup');
    } else if (!isUnlocked) {
      router.replace('/(auth)/unlock');
    } else {
      router.replace('/(tabs)/passwords');
    }

    // Hide native splash screen AFTER we've navigated
    // The new screen is already mounted by the time this runs
    SplashScreen.hideAsync().catch(() => {});
  }, [isLoading, isUnlocked, vaultExists]);

  // While loading: don't render the Stack at all so Expo Router has nothing to flash
  // The native splash screen is covering everything at this point
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
