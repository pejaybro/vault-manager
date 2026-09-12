import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Lock,
  Fingerprint,
  ShieldAlert,
  QrCode,
  FileUp,
  Smartphone,
  Tags,
  ChevronRight,
  Check,
  X,
} from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { AutofillModule } from '../../../modules/autofill/AutofillModule';
import { AppHeader } from '../../../components/AppHeader';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    lock,
    hasBiometrics,
    isBiometricsEnabled,
    enableBiometrics,
    disableBiometrics,
  } = useVault();

  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bioError, setBioError] = useState('');

  const handleToggleBio = async (enable: boolean) => {
    if (enable) {
      setConfirmPassword('');
      setBioError('');
      setBioModalVisible(true);
    } else {
      await disableBiometrics();
      Alert.alert('Biometrics Disabled', 'Biometric unlock has been turned off.');
    }
  };

  const handleConfirmEnableBio = async () => {
    if (!confirmPassword) {
      setBioError('Please enter your Master Password');
      return;
    }

    const success = await enableBiometrics(confirmPassword);
    if (success) {
      setBioModalVisible(false);
      setConfirmPassword('');
      Alert.alert('Success', 'Biometric login (Face ID / Fingerprint) is now active!');
    } else {
      setBioError('Incorrect Master Password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Settings" />

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Access</Text>

          {/* Biometrics Switch Row */}
          {hasBiometrics && (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, styles.iconBoxPrimary]}>
                  <Fingerprint size={20} color={COLORS.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.rowLabel}>Biometric Unlock</Text>
                  <Text style={styles.rowSub}>Use Face ID or Fingerprint to unlock</Text>
                </View>
              </View>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={handleToggleBio}
                trackColor={{ false: COLORS.surfaceBorder, true: COLORS.primary }}
                thumbColor="#FFF"
              />
            </View>
          )}

          {/* Autofill Provider Row */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => AutofillModule.openAutofillSettings()}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, styles.iconBoxSuccess]}>
                <Smartphone size={20} color={COLORS.success} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>System Autofill (Android)</Text>
                <Text style={styles.rowSub}>Set Vault Manager as default autofill service</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Lock Vault Row */}
          <TouchableOpacity
            style={[styles.row, styles.dangerRow]}
            onPress={lock}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, styles.iconBoxDanger]}>
                <Lock size={20} color={COLORS.danger} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.rowLabel, { color: COLORS.danger }]}>Lock Vault Now</Text>
                <Text style={styles.rowSub}>Clear decrypted vault memory & secure session</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        {/* Organization Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vault Organization</Text>

          {/* Manage Categories Row */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(tabs)/settings/categories' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, styles.iconBoxAccent]}>
                <Tags size={20} color={COLORS.accent} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>Manage Categories</Text>
                <Text style={styles.rowSub}>Add, organize, or remove custom password tags</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Sync & Backup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync & Backup</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(tabs)/settings/export')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, styles.iconBoxPrimary]}>
                <QrCode size={20} color={COLORS.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>Export Vault / QR Sync</Text>
                <Text style={styles.rowSub}>Create encrypted backup file or QR transfer payload</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(auth)/import')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, styles.iconBoxAccent]}>
                <FileUp size={20} color={COLORS.accent} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>Import Vault File</Text>
                <Text style={styles.rowSub}>Restore an encrypted JSON vault backup</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Vault Manager</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, styles.iconBoxMuted]}>
                <ShieldAlert size={20} color={COLORS.textMuted} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>Vault Manager v1.0.0</Text>
                <Text style={styles.rowSub}>Zero-Knowledge • AES-256-GCM • Offline Storage</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enable Biometrics Master Password Verification Modal */}
      <Modal
        visible={bioModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBioModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Fingerprint size={24} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Enable Biometrics</Text>
              </View>
              <TouchableOpacity onPress={() => setBioModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Confirm your Master Password once to securely register Face ID / Fingerprint on this device.
            </Text>

            <TextInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setBioError('');
              }}
              placeholder="Enter Master Password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              style={styles.modalInput}
              autoFocus
              onSubmitEditing={handleConfirmEnableBio}
            />

            {Boolean(bioError) && (
              <Text style={styles.bioErrorText}>{bioError}</Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBioModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmEnableBio}
              >
                <Check size={16} color="#FFF" />
                <Text style={styles.modalConfirmText}>Enable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: 80,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs + 2,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  dangerRow: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADII.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxPrimary: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  iconBoxSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  iconBoxDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  iconBoxAccent: {
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
  },
  iconBoxMuted: {
    backgroundColor: COLORS.card,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
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
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    marginVertical: SPACING.xs,
  },
  bioErrorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: SPACING.md,
  },
  modalCancelBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADII.md,
  },
  modalCancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADII.md,
  },
  modalConfirmText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
