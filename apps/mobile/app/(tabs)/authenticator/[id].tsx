import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, ShieldCheck, Copy, Check, Clock } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useVault } from '../../../context/VaultContext';
import { TOTPData } from '@vault/core';
import { useTOTP } from '../../../hooks/useTOTP';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

export default function TOTPDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { vault, deleteEntry } = useVault();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const entry = vault?.entries.find((e) => e.id === id);
  if (!entry || entry.type !== 'totp') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>TOTP entry not found</Text>
      </View>
    );
  }

  const data = entry.data as TOTPData;
  const { formattedCode, code, remaining, progress } = useTOTP(data.secret, data.period, data.digits);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    await deleteEntry(entry.id);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete 2FA Authenticator"
        message={`Are you sure you want to delete "${data.issuer}"? You will lose access to 2FA login.`}
        confirmText="Delete"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle} numberOfLines={1}>{data.issuer}</Text>
        <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
          <Trash2 size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.codeCard}>
        <ShieldCheck size={36} color={COLORS.success} />
        <Text style={styles.issuerName}>{data.issuer}</Text>
        <Text style={styles.accountText}>{data.account || 'Account'}</Text>

        <TouchableOpacity style={styles.codeContainer} onPress={handleCopy} activeOpacity={0.7}>
          <Text style={styles.codeText}>{formattedCode}</Text>
          {copied ? <Check size={24} color={COLORS.success} /> : <Copy size={20} color={COLORS.textMuted} />}
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress * 100}%`,
                backgroundColor: remaining < 5 ? COLORS.danger : COLORS.primary,
              },
            ]}
          />
        </View>

        <View style={styles.timerRow}>
          <Clock size={14} color={COLORS.textMuted} />
          <Text style={styles.timerText}>Refreshes in {remaining}s</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Technical Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Algorithm</Text>
          <Text style={styles.infoValue}>{data.algorithm || 'SHA1'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Digits</Text>
          <Text style={styles.infoValue}>{data.digits || 6}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Period</Text>
          <Text style={styles.infoValue}>{data.period || 30} seconds</Text>
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
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
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
    flex: 1,
    marginLeft: SPACING.sm,
  },
  codeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.lg,
  },
  issuerName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: SPACING.sm,
  },
  accountText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  codeText: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  timerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
