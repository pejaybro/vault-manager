import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FileUp, ArrowLeft, KeyRound } from 'lucide-react-native';
import { useVault } from '../../context/VaultContext';
import { SecureInput } from '../../components/SecureInput';
import { COLORS, RADII, SPACING } from '../../constants/theme';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export default function ImportScreen() {
  const router = useRouter();
  const { importVaultFile, isLoading } = useVault();

  const [vaultContent, setVaultContent] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleImport = async () => {
    setError('');
    if (!vaultContent.trim()) {
      setError('Please paste the encrypted vault payload');
      return;
    }
    if (!password) {
      setError('Please enter the vault master password');
      return;
    }

    const success = await importVaultFile(vaultContent.trim(), password);
    if (success) {
      Alert.alert('Success', 'Vault imported successfully!');
      router.replace('/(tabs)/passwords');
    } else {
      setError('Invalid password or corrupted vault data');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isLoading && <LoadingOverlay message="Importing & decrypting..." />}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={20} color={COLORS.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <FileUp size={40} color={COLORS.primary} />
        <Text style={styles.title}>Import Vault</Text>
        <Text style={styles.subtitle}>
          Paste your exported `.vault` payload or QR data to restore your vault.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Encrypted Vault Payload (JSON)</Text>
        <TextInput
          value={vaultContent}
          onChangeText={setVaultContent}
          placeholder='{"v":1,"salt":"...","iv":"...","data":"..."}'
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={6}
          style={styles.textArea}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <SecureInput
          label="Vault Master Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Master password for this vault"
          error={error}
        />

        <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
          <KeyRound size={20} color="#FFF" />
          <Text style={styles.importBtnText}>Decrypt & Import</Text>
        </TouchableOpacity>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  backText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  form: {
    width: '100%',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    color: COLORS.text,
    padding: SPACING.md,
    fontSize: 13,
    fontFamily: 'monospace',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  importBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
