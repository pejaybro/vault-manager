import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Lock, Fingerprint, ShieldAlert } from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

export default function SettingsScreen() {
  const { lock, hasBiometrics, enableBiometrics } = useVault();

  const handleEnableBio = async () => {
    Alert.prompt(
      'Enable Biometrics',
      'Enter Master Password to confirm:',
      async (pass) => {
        if (pass) {
          const ok = await enableBiometrics(pass);
          if (ok) Alert.alert('Success', 'Biometric unlock enabled!');
          else Alert.alert('Error', 'Could not enable biometrics.');
        }
      },
      'secure-text'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        {hasBiometrics && (
          <TouchableOpacity style={styles.row} onPress={handleEnableBio}>
            <View style={styles.rowLeft}>
              <Fingerprint size={20} color={COLORS.primary} />
              <Text style={styles.rowLabel}>Enable Biometrics (Face ID / Fingerprint)</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.row, styles.dangerRow]} onPress={lock}>
          <View style={styles.rowLeft}>
            <Lock size={20} color={COLORS.danger} />
            <Text style={[styles.rowLabel, { color: COLORS.danger }]}>Lock Vault Now</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <ShieldAlert size={20} color={COLORS.textMuted} />
            <View>
              <Text style={styles.rowLabel}>Vault Manager v1.0.0</Text>
              <Text style={styles.rowSub}>Fully offline AES-256-GCM encrypted vault</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingTop: 50,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  dangerRow: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rowLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
