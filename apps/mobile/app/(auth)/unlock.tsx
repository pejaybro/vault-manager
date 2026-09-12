import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Fingerprint, KeyRound } from 'lucide-react-native';
import { useVault } from '../../context/VaultContext';
import { SecureInput } from '../../components/SecureInput';
import { COLORS, RADII, SPACING } from '../../constants/theme';

export default function UnlockScreen() {
  const router = useRouter();
  const {
    unlockVault,
    unlockWithBiometrics,
    hasBiometrics,
    isBiometricsEnabled,
    isBiometricLoading,
    error,
  } = useVault();
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const autoTriggered = useRef(false);

  // Auto-prompt biometrics ONCE on mount if enabled — NOT on every render
  useEffect(() => {
    if (isBiometricsEnabled && hasBiometrics && !autoTriggered.current) {
      autoTriggered.current = true;
      const timer = setTimeout(async () => {
        const success = await unlockWithBiometrics();
        if (success) {
          router.replace('/(tabs)/passwords');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  // Only run once on mount - intentionally empty deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlock = async () => {
    if (!password || isUnlocking) return;
    setIsUnlocking(true);
    try {
      const success = await unlockVault(password);
      if (success) {
        router.replace('/(tabs)/passwords');
      }
    } finally {
      setIsUnlocking(false);
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

        <TouchableOpacity
          style={[styles.unlockBtn, isUnlocking && styles.btnDisabled]}
          onPress={handleUnlock}
          disabled={isUnlocking}
        >
          {isUnlocking ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <KeyRound size={20} color="#FFF" />
          )}
          <Text style={styles.unlockBtnText}>
            {isUnlocking ? 'Unlocking...' : 'Unlock Vault'}
          </Text>
        </TouchableOpacity>

        {hasBiometrics && isBiometricsEnabled && (
          <TouchableOpacity
            style={[styles.bioBtn, isBiometricLoading && styles.btnDisabled]}
            onPress={handleBiometrics}
            disabled={isBiometricLoading}
          >
            {isBiometricLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Fingerprint size={24} color={COLORS.primary} />
            )}
            <Text style={styles.bioBtnText}>
              {isBiometricLoading ? 'Waiting for biometrics...' : 'Unlock with Biometrics'}
            </Text>
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
  btnDisabled: {
    opacity: 0.6,
  },
});
