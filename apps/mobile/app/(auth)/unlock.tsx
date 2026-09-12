import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { ShieldCheck, Fingerprint, KeyRound, ScanFace } from 'lucide-react-native';
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
  // Track whether we already auto-triggered biometrics this session
  const autoTriggered = useRef(false);
  // Biometric type for correct icon/label
  const [bioType, setBioType] = useState<'face' | 'fingerprint' | 'none'>('none');

  // Detect biometric hardware type
  useEffect(() => {
    LocalAuthentication.supportedAuthenticationTypesAsync().then((types) => {
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBioType('face');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBioType('fingerprint');
      }
    });
  }, []);

  // Auto-prompt biometrics ONCE on mount if enabled
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
  // Run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlock = async () => {
    if (!password.trim() || isUnlocking) return;
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

  const bioLabel = bioType === 'face'
    ? (Platform.OS === 'ios' ? 'Unlock with Face ID' : 'Unlock with Face Recognition')
    : 'Unlock with Fingerprint';

  const BioIcon = bioType === 'face' ? ScanFace : Fingerprint;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <ShieldCheck size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Vault Locked</Text>
        <Text style={styles.subtitle}>Enter your Master Password to unlock</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <SecureInput
          label="Master Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter Master Password"
          error={error || undefined}
          onSubmitEditing={handleUnlock}
        />

        <TouchableOpacity
          style={[styles.unlockBtn, isUnlocking && styles.btnDisabled]}
          onPress={handleUnlock}
          disabled={isUnlocking}
          activeOpacity={0.8}
        >
          {isUnlocking
            ? <ActivityIndicator size="small" color="#FFF" />
            : <KeyRound size={20} color="#FFF" />
          }
          <Text style={styles.unlockBtnText}>
            {isUnlocking ? 'Unlocking...' : 'Unlock Vault'}
          </Text>
        </TouchableOpacity>

        {/* Biometric button — shown for both iOS Face ID and Android Fingerprint */}
        {hasBiometrics && isBiometricsEnabled && (
          <TouchableOpacity
            style={[styles.bioBtn, isBiometricLoading && styles.btnDisabled]}
            onPress={handleBiometrics}
            disabled={isBiometricLoading}
            activeOpacity={0.8}
          >
            {isBiometricLoading
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <BioIcon size={22} color={COLORS.primary} />
            }
            <Text style={styles.bioBtnText}>
              {isBiometricLoading ? 'Waiting...' : bioLabel}
            </Text>
          </TouchableOpacity>
        )}

        {/* Hint when biometric is available but not yet enabled */}
        {hasBiometrics && !isBiometricsEnabled && (
          <Text style={styles.bioHint}>
            Tip: Enable {bioType === 'face' ? 'Face ID' : 'Fingerprint'} in Settings for faster access.
          </Text>
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
    width: 90,
    height: 90,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
    // Subtle glow
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  form: { width: '100%' },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: RADII.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  unlockBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: RADII.md,
    marginTop: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '40',  // semi-transparent primary border
    gap: SPACING.sm,
  },
  bioBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  bioHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
  btnDisabled: { opacity: 0.55 },
});
