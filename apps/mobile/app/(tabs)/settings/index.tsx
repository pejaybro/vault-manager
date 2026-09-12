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
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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
  Eye,
  EyeOff,
  ScanFace,
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
  const [showPassword, setShowPassword] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  // Label changes per platform
  const bioLabel = Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Fingerprint Unlock';
  const bioSubLabel = Platform.OS === 'ios'
    ? 'Use Face ID or Touch ID to unlock vault'
    : 'Use fingerprint sensor to unlock vault';
  const BioIcon = Platform.OS === 'ios' ? ScanFace : Fingerprint;

  const handleToggleBio = async (enable: boolean) => {
    if (enable) {
      setConfirmPassword('');
      setBioError('');
      setShowPassword(false);
      setBioModalVisible(true);
    } else {
      await disableBiometrics();
      Alert.alert(
        'Biometrics Disabled',
        `${bioLabel} unlock has been turned off.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleConfirmEnableBio = async () => {
    if (!confirmPassword.trim()) {
      setBioError('Please enter your Master Password');
      return;
    }
    setIsEnabling(true);
    setBioError('');
    try {
      const success = await enableBiometrics(confirmPassword);
      if (success) {
        setBioModalVisible(false);
        setConfirmPassword('');
        Alert.alert(
          'Biometrics Enabled ✅',
          `${bioLabel} is now active. Next time you open the app, you will be prompted automatically.`,
          [{ text: 'Got it' }]
        );
      } else {
        setBioError('Incorrect Master Password. Please try again.');
      }
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Settings" />

      <ScrollView style={styles.body} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Security & Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Access</Text>

          {hasBiometrics && (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, styles.iconBoxPrimary]}>
                  <BioIcon size={20} color={COLORS.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.rowLabel}>{bioLabel}</Text>
                  <Text style={styles.rowSub}>{bioSubLabel}</Text>
                </View>
              </View>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={handleToggleBio}
                trackColor={{ false: COLORS.surfaceBorder, true: COLORS.primary }}
                thumbColor="#FFF"
                ios_backgroundColor={COLORS.surfaceBorder}
              />
            </View>
          )}

          {/* Android only — System Autofill */}
          {Platform.OS === 'android' && (
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
          )}

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

        {/* Vault Organization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vault Organization</Text>
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

        {/* Sync & Backup */}
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

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Vault Manager</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, styles.iconBoxMuted]}>
                <ShieldAlert size={20} color={COLORS.textMuted} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowLabel}>Vault Manager v1.0.0</Text>
                <Text style={styles.rowSub}>Zero-Knowledge • AES-256-GCM • Fully Offline</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ====== Enable Biometrics Modal ====== */}
      <Modal
        visible={bioModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => { if (!isEnabling) setBioModalVisible(false); }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <BioIcon size={22} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Enable {bioLabel}</Text>
              </View>
              {!isEnabling && (
                <TouchableOpacity onPress={() => setBioModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.modalSubtitle}>
              Confirm your Master Password once to register {bioLabel} on this device.
            </Text>

            {/* Password input with show/hide toggle */}
            <View style={styles.inputWrapper}>
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setBioError('');
                }}
                placeholder="Enter Master Password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                style={styles.modalInput}
                autoFocus
                editable={!isEnabling}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleConfirmEnableBio}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword
                  ? <EyeOff size={18} color={COLORS.textMuted} />
                  : <Eye size={18} color={COLORS.textMuted} />
                }
              </TouchableOpacity>
            </View>

            {Boolean(bioError) && (
              <Text style={styles.bioErrorText}>{bioError}</Text>
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBioModalVisible(false)}
                disabled={isEnabling}
              >
                <Text style={[styles.modalCancelText, isEnabling && { opacity: 0.4 }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, isEnabling && styles.btnDisabled]}
                onPress={handleConfirmEnableBio}
                disabled={isEnabling}
              >
                {isEnabling ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Check size={16} color="#FFF" />
                )}
                <Text style={styles.modalConfirmText}>
                  {isEnabling ? 'Verifying...' : 'Enable'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: 80,
  },
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
  dangerRow: { borderColor: 'rgba(239,68,68,0.25)' },
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
  iconBoxPrimary:  { backgroundColor: 'rgba(99,102,241,0.12)' },
  iconBoxSuccess:  { backgroundColor: 'rgba(34,197,94,0.12)' },
  iconBoxDanger:   { backgroundColor: 'rgba(239,68,68,0.12)' },
  iconBoxAccent:   { backgroundColor: 'rgba(129,140,248,0.12)' },
  iconBoxMuted:    { backgroundColor: COLORS.card },
  textContainer: { flex: 1, flexShrink: 1 },
  rowLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  rowSub:   { color: COLORS.textMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',      // Slides up from bottom — better UX on all phones
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md, // safe area
  },
  modalCard: {
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
    marginBottom: SPACING.sm,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },

  // Input with eye toggle
  inputWrapper: { position: 'relative', marginBottom: 6 },
  modalInput: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    // White text so it's visible on dark background
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    paddingRight: 48,          // make room for eye icon
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  bioErrorText: { color: COLORS.danger, fontSize: 13, marginTop: 2, marginBottom: 4 },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: SPACING.md,
  },
  modalCancelBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modalCancelText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  modalConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 11,
    borderRadius: RADII.md,
    minWidth: 110,
    justifyContent: 'center',
  },
  modalConfirmText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});
