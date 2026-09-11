import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, QrCode, Copy, Share2, ShieldAlert } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useVault } from '../../../context/VaultContext';
import { SecureInput } from '../../../components/SecureInput';
import { STORAGE_KEYS } from '@vault/core';
import { mobileStorage } from '../../../storage/ExpoStorageAdapter';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

export default function ExportVaultScreen() {
  const router = useRouter();
  const { unlockVault } = useVault();

  const [password, setPassword] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [encryptedPayload, setEncryptedPayload] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    if (!password) {
      setError('Please enter your Master Password');
      return;
    }

    const isValid = await unlockVault(password);
    if (!isValid) {
      setError('Invalid Master Password');
      return;
    }

    const rawVault = await mobileStorage.read(STORAGE_KEYS.VAULT);
    if (rawVault) {
      setEncryptedPayload(rawVault);
      setIsConfirmed(true);
    } else {
      setError('Vault data not found');
    }
  };

  const handleCopyPayload = async () => {
    await Clipboard.setStringAsync(encryptedPayload);
    Alert.alert('Copied', 'Encrypted vault payload copied to clipboard.');
  };

  const handleShareFile = async () => {
    try {
      const dir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
      const fileUri = `${dir}vault_backup.vault`;
      await FileSystem.writeAsStringAsync(fileUri, encryptedPayload);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Encrypted Vault Backup',
        });
      } else {
        Alert.alert('Share Unavailable', 'Sharing is not available on this device.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to export file');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Export & Sync Vault</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isConfirmed ? (
        <View style={styles.formCard}>
          <ShieldAlert size={36} color={COLORS.warning} style={{ alignSelf: 'center', marginBottom: SPACING.sm }} />
          <Text style={styles.confirmTitle}>Confirm Master Password</Text>
          <Text style={styles.confirmSub}>
            Enter your master password to authorize vault export & QR code generation.
          </Text>

          <SecureInput
            label="Master Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Master Password"
            error={error}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm}>
            <Text style={styles.primaryBtnText}>Authorize Export</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.exportCard}>
          <Text style={styles.exportTitle}>Encrypted QR Code</Text>
          <Text style={styles.exportSub}>Scan this QR code from your Desktop or second device to sync.</Text>

          <View style={styles.qrBox}>
            <QRCode
              value={encryptedPayload.slice(0, 800)} // SVG QR display
              size={220}
              color="#000"
              backgroundColor="#FFF"
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopyPayload}>
              <Copy size={18} color={COLORS.text} />
              <Text style={styles.actionBtnText}>Copy Payload</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.accentBtn]} onPress={handleShareFile}>
              <Share2 size={18} color="#FFF" />
              <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Share .vault File</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.warningText}>
            🔒 Your data is exported as an AES-256-GCM encrypted payload. The receiving device will require your Master Password to decrypt.
          </Text>
        </View>
      )}
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
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginTop: SPACING.md,
  },
  confirmTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  primaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  exportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  exportTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  exportSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  qrBox: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.xs,
  },
  accentBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
});
