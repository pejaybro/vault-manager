import 'react-native-get-random-values';
import { Crypto as PeculiarCrypto } from '@peculiar/webcrypto';

if (typeof globalThis !== 'undefined' && globalThis.crypto) {
  if (!(globalThis.crypto as any).subtle) {
    const peculiar = new PeculiarCrypto();
    (globalThis.crypto as any).subtle = peculiar.subtle;
  }
}

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VaultProvider, useVault } from '../context/VaultContext';
import { DrawerProvider } from '../context/DrawerContext';
import { SideDrawer } from '../components/SideDrawer';
import { COLORS } from '../constants/theme';

function RootLayoutNav() {
  const { isUnlocked, vaultExists, isLoading } = useVault();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Do not navigate until the vault existence check is complete.
    // This is what prevents the setup screen flash.
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

  // While checking vault state: render a plain dark background.
  // This prevents ANY flash of wrong screen before we know where to navigate.
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          // No animation so there's no slide/flash between auth and app screens
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
