import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, QrCode, KeyRound } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useVault } from '../../../context/VaultContext';
import { validateSecret, parseTOTPUri, TOTPData } from '@vault/core';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

export default function AddTOTPScreen() {
  const router = useRouter();
  const { addEntry } = useVault();
  const [permission, requestPermission] = useCameraPermissions();

  const [mode, setMode] = useState<'manual' | 'scan'>('manual');
  const [issuer, setIssuer] = useState('');
  const [account, setAccount] = useState('');
  const [secret, setSecret] = useState('');
  const [period, setPeriod] = useState<30 | 60>(30);
  const [digits, setDigits] = useState<6 | 8>(6);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    const parsed = parseTOTPUri(data);
    if (parsed) {
      setIssuer(parsed.issuer);
      setAccount(parsed.account);
      setSecret(parsed.secret);
      setPeriod(parsed.period);
      setDigits(parsed.digits);
      setMode('manual');
      Alert.alert('Scanned QR', `Found ${parsed.issuer} (${parsed.account})`);
    } else {
      Alert.alert('Invalid QR', 'QR code is not a valid 2FA authenticator barcode.');
    }
  };

  const handleSave = async () => {
    if (!issuer.trim()) {
      Alert.alert('Error', 'Please enter an Issuer (e.g., GitHub, Google)');
      return;
    }
    if (!secret.trim()) {
      Alert.alert('Error', 'Please enter a Secret Key');
      return;
    }

    const cleanSecret = secret.trim().replace(/\s+/g, '').toUpperCase();
    if (!validateSecret(cleanSecret)) {
      Alert.alert('Invalid Secret', 'Secret key must be a valid Base32 string (A-Z, 2-7)');
      return;
    }

    const data: TOTPData = {
      secret: cleanSecret,
      issuer: issuer.trim(),
      account: account.trim(),
      algorithm: 'SHA1',
      digits,
      period,
    };

    await addEntry({
      type: 'totp',
      name: `${issuer.trim()} (${account.trim() || 'Account'})`,
      favourite: false,
      data,
    });

    router.back();
  };

  const startScanner = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
        return;
      }
    }
    setMode('scan');
  };

  if (mode === 'scan') {
    return (
      <View style={styles.scannerContainer}>
        <View style={styles.scannerHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setMode('manual')}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.scannerTitle}>Scan 2FA QR Code</Text>
        </View>

        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        <View style={styles.overlayFrame} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Add 2FA Authenticator</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={18} color="#FFF" />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.scanCard} onPress={startScanner}>
        <QrCode size={32} color={COLORS.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.scanCardTitle}>Scan QR Code</Text>
          <Text style={styles.scanCardSub}>Use camera to scan 2FA barcode from website</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.orDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.orText}>OR ENTER MANUALLY</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Service / Issuer Name *</Text>
        <TextInput
          value={issuer}
          onChangeText={setIssuer}
          placeholder="e.g. GitHub, Google, Amazon"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Account / Email</Text>
        <TextInput
          value={account}
          onChangeText={setAccount}
          placeholder="e.g. user@email.com"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Secret Key (Base32) *</Text>
        <TextInput
          value={secret}
          onChangeText={setSecret}
          placeholder="e.g. JBSWY3DPEHPK3PXP"
          placeholderTextColor={COLORS.textMuted}
          style={[styles.input, styles.monospace]}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <View style={styles.rowOptions}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Refresh Period</Text>
            <View style={styles.optionGroup}>
              {[30, 60].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.optChip, period === p && styles.optChipActive]}
                  onPress={() => setPeriod(p as any)}
                >
                  <Text style={[styles.optChipText, period === p && styles.optChipTextActive]}>
                    {p}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Code Digits</Text>
            <View style={styles.optionGroup}>
              {[6, 8].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.optChip, digits === d && styles.optChipActive]}
                  onPress={() => setDigits(d as any)}
                >
                  <Text style={[styles.optChipText, digits === d && styles.optChipTextActive]}>
                    {d} Digits
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.md,
    gap: 6,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.md,
  },
  scanCardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  scanCardSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
  },
  orText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  form: {
    width: '100%',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
  },
  monospace: {
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  rowOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  optChip: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  optChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  optChipTextActive: {
    color: '#FFF',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  scannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  overlayFrame: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '35%',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADII.lg,
  },
});
