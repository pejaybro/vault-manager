import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Fingerprint, KeyRound } from 'lucide-react-native';
import { useVault } from '../../context/VaultContext';
import { SecureInput } from '../../components/SecureInput';
import { COLORS, RADII, SPACING } from '../../constants/theme';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export default function UnlockScreen() {
  const router = useRouter();
  const { unlockVault, unlockWithBiometrics, hasBiometrics, isLoading, error } = useVault();
  const [password, setPassword] = useState('');

  const handleUnlock = async () => {
    if (!password) return;
    const success = await unlockVault(password);
    if (success) {
      router.replace('/(tabs)/passwords');
    }
  };

  const handleBiometrics = async () => {
    const success = await unlockWithBiometrics();
    if (success) {
      router.replace('/(tabs)/passwords');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <LoadingOverlay message="Decrypting vault..." />}

      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <ShieldCheck size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Vault Locked</Text>
        <Text style={styles.subtitle}>Enter your Master Password to unlock</Text>
      </View>

      <View style={styles.form}>
        <SecureInput
          label="Master Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Master Password"
          error={error || undefined}
        />

        <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
          <KeyRound size={20} color="#FFF" />
          <Text style={styles.unlockBtnText}>Unlock Vault</Text>
        </TouchableOpacity>

        {hasBiometrics && (
          <TouchableOpacity style={styles.bioBtn} onPress={handleBiometrics}>
            <Fingerprint size={24} color={COLORS.primary} />
            <Text style={styles.bioBtnText}>Unlock with Biometrics</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  form: {
    width: '100%',
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  unlockBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.sm,
  },
  bioBtnText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
