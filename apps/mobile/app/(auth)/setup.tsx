import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react-native';
import { useVault } from '../../context/VaultContext';
import { SecureInput } from '../../components/SecureInput';
import { COLORS, RADII, SPACING } from '../../constants/theme';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export default function SetupScreen() {
  const router = useRouter();
  const { createVault, isLoading } = useVault();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleCreate = async () => {
    setError('');
    if (!password) {
      setError('Please enter a master password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!minLength) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await createVault(password);
      router.replace('/(tabs)/passwords');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create vault');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isLoading && <LoadingOverlay message="Encrypting and initializing vault..." />}

      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <ShieldCheck size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Vault Manager</Text>
        <Text style={styles.subtitle}>
          Create a Master Password to lock & encrypt your offline vault.
        </Text>
      </View>

      <View style={styles.form}>
        <SecureInput
          label="Master Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter strong master password"
        />

        <SecureInput
          label="Confirm Master Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter master password"
          error={error}
        />

        <View style={styles.requirementsCard}>
          <Text style={styles.reqTitle}>Password Requirements:</Text>
          <View style={styles.reqRow}>
            <CheckCircle2 size={16} color={minLength ? COLORS.success : COLORS.textMuted} />
            <Text style={[styles.reqText, minLength && styles.reqTextActive]}>
              At least 8 characters
            </Text>
          </View>
          <View style={styles.reqRow}>
            <CheckCircle2 size={16} color={hasUpper ? COLORS.success : COLORS.textMuted} />
            <Text style={[styles.reqText, hasUpper && styles.reqTextActive]}>
              At least one uppercase letter (A-Z)
            </Text>
          </View>
          <View style={styles.reqRow}>
            <CheckCircle2 size={16} color={hasNumber ? COLORS.success : COLORS.textMuted} />
            <Text style={[styles.reqText, hasNumber && styles.reqTextActive]}>
              At least one number (0-9)
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Lock size={20} color="#FFF" />
          <Text style={styles.createBtnText}>Create Encrypted Vault</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.importBtn}
          onPress={() => router.push('/(auth)/import')}
        >
          <Text style={styles.importBtnText}>Import Existing Vault File</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.warning}>
        ⚠️ Important: Your Master Password cannot be recovered if forgotten. All data is encrypted locally.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
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
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  requirementsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.xs,
  },
  reqTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  reqTextActive: {
    color: COLORS.success,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  importBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },
  importBtnText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  warning: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
