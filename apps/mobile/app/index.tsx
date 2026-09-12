import React from 'react';
import { Redirect } from 'expo-router';
import { useVault } from '../context/VaultContext';
import { LoadingOverlay } from '../components/LoadingOverlay';

export default function Index() {
  const { isUnlocked, vaultExists, isLoading } = useVault();

  if (isLoading) {
    return <LoadingOverlay message="Checking vault security..." />;
  }

  if (!vaultExists) {
    return <Redirect href="/(auth)/setup" />;
  }

  if (!isUnlocked) {
    return <Redirect href="/(auth)/unlock" />;
  }

  return <Redirect href="/(tabs)/passwords" />;
}
