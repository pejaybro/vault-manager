import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit2, Trash2, Globe, User, KeyRound, ExternalLink, Star } from 'lucide-react-native';
import { useVault } from '../../../context/VaultContext';
import { PasswordData } from '@vault/core';
import { CopyButton } from '../../../components/CopyButton';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { calculatePasswordStrength } from '../../../components/PasswordGenerator';
import { COLORS, RADII, SPACING } from '../../../constants/theme';

export default function PasswordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { vault, deleteEntry, toggleFav } = useVault();

  const [showPass, setShowPass] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const entry = vault?.entries.find((e) => e.id === id);
  if (!entry || entry.type !== 'password') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Password entry not found</Text>
      </View>
    );
  }

  const data = entry.data as PasswordData;
  const strength = calculatePasswordStrength(data.password);

  const handleDelete = async () => {
    await deleteEntry(entry.id);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Password"
        message={`Are you sure you want to delete "${entry.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle} numberOfLines={1}>{entry.name}</Text>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => toggleFav(entry.id)}>
            <Star
              size={20}
              color={entry.favourite ? COLORS.warning : COLORS.textMuted}
              fill={entry.favourite ? COLORS.warning : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/(tabs)/passwords/edit/${entry.id}` as any)}>
            <Edit2 size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <Trash2 size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldGroup}>
          <View style={styles.fieldHeader}>
            <User size={16} color={COLORS.textMuted} />
            <Text style={styles.fieldLabel}>Username / Email</Text>
          </View>
          <View style={styles.fieldValueRow}>
            <Text style={styles.fieldValue}>{data.username || '—'}</Text>
            {data.username ? <CopyButton value={data.username} /> : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldGroup}>
          <View style={styles.fieldHeader}>
            <KeyRound size={16} color={COLORS.textMuted} />
            <Text style={styles.fieldLabel}>Password</Text>
          </View>
          <View style={styles.fieldValueRow}>
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ flex: 1 }}>
              <Text style={[styles.fieldValue, styles.monospace]}>
                {showPass ? data.password : '••••••••••••••••'}
              </Text>
            </TouchableOpacity>
            <CopyButton value={data.password} />
          </View>

          <View style={styles.strengthRow}>
            <Text style={styles.strengthText}>Strength: </Text>
            <Text style={[styles.strengthValue, { color: strength.color }]}>{strength.label}</Text>
          </View>
        </View>

        {data.url && (
          <>
            <View style={styles.divider} />
            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Globe size={16} color={COLORS.textMuted} />
                <Text style={styles.fieldLabel}>Website</Text>
              </View>
              <View style={styles.fieldValueRow}>
                <TouchableOpacity
                  style={styles.urlRow}
                  onPress={() => Linking.openURL(data.url!)}
                >
                  <Text style={styles.urlText} numberOfLines={1}>{data.url}</Text>
                  <ExternalLink size={14} color={COLORS.primary} />
                </TouchableOpacity>
                <CopyButton value={data.url} />
              </View>
            </View>
          </>
        )}

        {data.notes && (
          <>
            <View style={styles.divider} />
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          </>
        )}
      </View>

      <Text style={styles.metaText}>
        Category: {data.category.toUpperCase()} • Created: {new Date(entry.createdAt).toLocaleDateString()}
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
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  fieldGroup: {
    paddingVertical: SPACING.xs,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  fieldValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  monospace: {
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: SPACING.sm,
  },
  strengthRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  strengthText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  urlText: {
    color: COLORS.primary,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  notesText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
